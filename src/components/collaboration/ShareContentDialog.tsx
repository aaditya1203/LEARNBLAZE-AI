import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ShareContentDialogProps {
  contentId: string;
  contentTitle: string;
}

const ShareContentDialog = ({ contentId, contentTitle }: ShareContentDialogProps) => {
  const [email, setEmail] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [open, setOpen] = useState(false);

  const handleShare = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setIsSharing(true);

    try {
      // Get the user ID from email
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (profileError || !profiles) {
        toast({
          title: "Error",
          description: "User not found with this email",
          variant: "destructive",
        });
        setIsSharing(false);
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to share content",
          variant: "destructive",
        });
        setIsSharing(false);
        return;
      }

      // Share the content
      const { error: shareError } = await supabase
        .from("shared_content")
        .insert({
          content_id: contentId,
          shared_by: user.id,
          shared_with: profiles.id,
        });

      if (shareError) {
        if (shareError.code === '23505') {
          toast({
            title: "Already Shared",
            description: "This content is already shared with this user",
          });
        } else {
          throw shareError;
        }
      } else {
        toast({
          title: "Success",
          description: `Content shared with ${email}`,
        });
        setEmail("");
        setOpen(false);
      }
    } catch (error) {
      console.error("Error sharing content:", error);
      toast({
        title: "Error",
        description: "Failed to share content",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="hover:bg-primary/10 hover:text-primary hover:border-primary/50"
        >
          <Share2 className="h-3.5 w-3.5 mr-1.5" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Content</DialogTitle>
          <DialogDescription>
            Share "{contentTitle}" with another user by entering their email
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">User Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleShare();
                }
              }}
            />
          </div>
          <Button
            onClick={handleShare}
            disabled={isSharing}
            className="w-full"
          >
            {isSharing ? "Sharing..." : "Share Content"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareContentDialog;
