'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  PlusCircle, 
  Tag, 
  FileText, 
  Grid, 
  DollarSign, 
  Clock, 
  ImagePlus,
  Gavel,
  ShoppingCart 
} from 'lucide-react';

export default function CreateListing() {
  const [files, setFiles] = useState<File[]>([]);
  const [listingType, setListingType] = useState<'BUY_NOW' | 'BID'>('BUY_NOW');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    askingPrice: '',
    minOfferPrice: '',
    startingPrice: '',
    endTime: '',
    minBidIncrement: '1.00',
  });

  const handleFileUpload = (files: File[]) => {
    setFiles(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    files.forEach((file) => {
      formDataToSend.append('files', file);
    });

    Object.entries(formData).forEach(([key, value]) => {
      if (value) formDataToSend.append(key, value);
    });
    formDataToSend.append('listingType', listingType);

    try {
      const response = await fetch('/api/listings/create', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to create listing');
      }

      window.location.href = '/my-listings';
    } catch (error) {
      console.error('Error creating listing:', error);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight flex items-center justify-center gap-3">
          <PlusCircle className="h-8 w-8 text-primary" />
          Create New Listing
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Share your item or service with potential buyers
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl">Listing Details</CardTitle>
          <CardDescription className="text-base">
            Fill in the details to create your perfect listing
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <Label className="text-base">Listing Type</Label>
              <div className="flex items-center space-x-3 p-3 rounded-lg">
                <Switch
                  checked={listingType === 'BID'}
                  onCheckedChange={(checked) =>
                    setListingType(checked ? 'BID' : 'BUY_NOW')
                  }
                />
                <span className="flex items-center gap-2 text-base">
                  {listingType === 'BID' ? (
                    <>
                      <Gavel className="h-5 w-5 text-primary" />
                      Auction
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 text-primary" />
                      Buy Now
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2 text-base">
                <Tag className="h-4 w-4" />
                Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="min-h-[100px] text-base"
                placeholder="Describe your item or service in detail"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center gap-2 text-base">
                <Grid className="h-4 w-4" />
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className="text-base">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="vg_cons">Video Games and Consoles</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="toys">Toys</SelectItem>
                  <SelectItem value="books">Books</SelectItem>
                  <SelectItem value="home">Home & Garden</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {listingType === 'BUY_NOW' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="askingPrice" className="flex items-center gap-2 text-base">
                    <DollarSign className="h-4 w-4" />
                    Asking Price
                  </Label>
                  <Input
                    id="askingPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.askingPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, askingPrice: e.target.value })
                    }
                    className="text-base"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minOfferPrice" className="flex items-center gap-2 text-base">
                    <DollarSign className="h-4 w-4" />
                    Minimum Offer Price (Optional)
                  </Label>
                  <Input
                    id="minOfferPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minOfferPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, minOfferPrice: e.target.value })
                    }
                    className="text-base"
                  />
                </div>
              </>
            ) : (
              <>
                  <div className="space-y-2">
                    <Label htmlFor="startingPrice" className="flex items-center gap-2 text-base">
                      <DollarSign className="h-4 w-4" />
                      Starting Price
                    </Label>
                    <Input
                      id="startingPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.startingPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, startingPrice: e.target.value })
                      }
                      className="text-base"
                      required
                    />
                  </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime" className="flex items-center gap-2 text-base">
                    <Clock className="h-4 w-4" />
                    End Time
                  </Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className="text-base"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minBidIncrement" className="flex items-center gap-2 text-base">
                    <DollarSign className="h-4 w-4" />
                    Minimum Bid Increment
                  </Label>
                  <Input
                    id="minBidIncrement"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minBidIncrement}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minBidIncrement: e.target.value,
                      })
                    }
                    className="text-base"
                    required
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-base">
                <ImagePlus className="h-4 w-4" />
                Images
              </Label>
              <FileUpload onChange={handleFileUpload} />
            </div>

            <Button type="submit" className="w-full text-lg py-6 mt-8">
              Create Listing
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}