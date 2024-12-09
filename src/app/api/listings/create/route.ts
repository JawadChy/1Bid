import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // get user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profile")
      .select("role, is_suspended")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (profile.is_suspended) {
      return NextResponse.json(
        { error: "Account is suspended" },
        { status: 403 }
      );
    }

    // deny user from posting listing if not approp role -> TODO: TEMP ALLOWING S TO POST, BUT THEY SHOULDN'T BE ABLE TO IN PROD
    if (profile.role !== "U" && profile.role !== "S") {
      return NextResponse.json(
        { error: "Only users can create listings" },
        { status: 403 }
      );
    }

    const formData = await request.formData();

    const isItem = formData.get("item") === "TRUE";
    const isRental = formData.get("rent") === "TRUE";

    // (MAIN)listing table row
    const { data: listing, error: listingError } = await supabase
      .from("listing")
      .insert({
        seller_id: user.id,
        title: formData.get("title"),
        description: formData.get("description"),
        category: formData.get("category"),
        listing_type: formData.get("listingType"),
        status: "ACTIVE",
        item_or_service: isItem,
        rent: isRental,
      })
      .select()
      .single();

    if (listingError) {
      console.error("Listing creation error:", listingError);
      return NextResponse.json(
        { error: "Failed to create listing" },
        { status: 500 }
      );
    }

    // files
    const files = formData.getAll("files") as File[];
    const imageUrls: string[] = [];

    console.log(files);

    if (files.length === 0) {
        await supabase.from('listing').delete().eq('id', listing.id)
        return NextResponse.json(
          { error: 'At least one image is required' },
          { status: 400 }
        )
      }

    // upload each file one by one, and get url
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split(".").pop();

      // name files listingid_(order of img) - remember this format when displaying imgs in listing page
      const fileName = `${listing.id}_${i + 1}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("listing_images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        // cleanup
        await supabase.from('listing').delete().eq('id', listing.id)
        console.error("File upload error:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload images" },
          { status: 500 }
        );
      }

      // get public url after upload

      const {
        data: { publicUrl },
      } = supabase.storage.from("listing_images").getPublicUrl(filePath);

      imageUrls.push(publicUrl);
    }

    // validate other required fields
    const title = formData.get("title");
    const description = formData.get("description");
    const category = formData.get("category");
    const listingType = formData.get("listingType");

    if (!title || !description || !category || !listingType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (imageUrls.length > 0) {
      const { error: imageError } = await supabase.from("listing_image").insert(
        imageUrls.map((url, index) => ({
          listing_id: listing.id,
          storage_path: url,
          position: index + 1,
          public_url: url,
        }))
      );

      if (imageError) {
        // rollback if err
        await supabase.from("listing").delete().eq("id", listing.id);
        await Promise.all(
          imageUrls.map((url) =>
            supabase.storage.from("listing_images").remove([url])
          )
        );
        return NextResponse.json(
          { error: "Failed to store image references" },
          { status: 500 }
        );
      }
    }

    // insert into either bid or now table
    if (listingType === "BUY_NOW") {
      const askingPrice = formData.get("askingPrice");
      if (!askingPrice) {
        // rollback MAIN
        await supabase.from("listing").delete().eq("id", listing.id);
        return NextResponse.json(
          { error: "Asking price is required for buy now listings" },
          { status: 400 }
        );
      }

      const { error: buyNowError } = await supabase
        .from("buy_now_listing")
        .insert({
          listing_id: listing.id,
          asking_price: parseFloat(askingPrice as string),
          min_offer_price: formData.get("minOfferPrice")
            ? parseFloat(formData.get("minOfferPrice") as string)
            : null,
        });

      if (buyNowError) {
        // rollback
        await supabase.from("listing").delete().eq("id", listing.id);
        console.error("Buy now listing error:", buyNowError);
        return NextResponse.json(
          { error: "Failed to create buy now listing details" },
          { status: 500 }
        );
      }
    } else {
      // Handle BID type
      const startingPrice = formData.get("startingPrice");
      const endTime = formData.get("endTime");
      const minBidIncrement = formData.get("minBidIncrement");

      if (!startingPrice || !endTime) {
        // rollback
        await supabase.from("listing").delete().eq("id", listing.id);
        return NextResponse.json(
          {
            error: "Starting price and end time are required for bid listings",
          },
          { status: 400 }
        );
      }

      const { error: bidError } = await supabase.from("bid_listing").insert({
        listing_id: listing.id,
        starting_price: parseFloat(startingPrice as string),
        end_time: new Date(endTime as string).toISOString(),
        min_bid_increment: minBidIncrement
          ? parseFloat(minBidIncrement as string)
          : 1.0,
      });

      if (bidError) {
        // rollback
        await supabase.from("listing").delete().eq("id", listing.id);
        console.error("Bid listing error:", bidError);
        return NextResponse.json(
          { error: "Failed to create bid listing details" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      message: "Listing created successfully",
      listing: {
        id: listing.id,
        title: listing.title,
        type: listingType,
        images: imageUrls,
      },
    });
  } catch (error) {
    console.error("Error creating listing:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
