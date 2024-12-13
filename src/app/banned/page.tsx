import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertOctagon, ClipboardPen } from "lucide-react"
import { toast } from "react-hot-toast";

export default function BannedPage() {
    const handleCopyEmail = () => {
        navigator.clipboard.writeText('support@1bid.app');
        toast.success('Support Email Copied to Clipboard', {
            position: 'bottom-center',
            duration: 2000
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <AlertOctagon className="h-12 w-12 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl">Account Banned</CardTitle>
                    <CardDescription>
                        Your account has been permanently banned due to multiple violations of our terms of service.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        This decision was made after receiving multiple suspensions. We take our community guidelines seriously to ensure a safe and respectful environment for all users.
                    </p>

                    <div className="bg-muted p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">What this means:</h3>
                        <ul className="text-sm space-y-2 text-muted-foreground">
                            <li>• Your account has been permanently deleted</li>
                            <li>• You cannot create a new account</li>
                            <li>• All your listings have been removed</li>
                            <li>• Any active transactions have been cancelled</li>
                        </ul>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col space-y-3">
                    <a href="mailto:support@1bid.app" className="w-full inline-block" onClick={handleCopyEmail}>
                        <Button variant="outline" className="w-full flex items-center gap-2">
                            Contact Support
                            <ClipboardPen className="h-4 w-4" />
                        </Button>
                    </a>
                </CardFooter>
            </Card>
        </div>
    )
}