import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function DeckNotFound() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card className="text-center py-12">
          <CardContent className="pt-6">
            <div className="text-muted-foreground mb-4">
              <AlertTriangle className="mx-auto h-16 w-16" />
            </div>
            <CardTitle className="text-2xl mb-2">Deck Not Found</CardTitle>
            <CardDescription className="text-lg mb-6">
              The deck you&apos;re looking for doesn&apos;t exist or you
              don&apos;t have permission to view it.
            </CardDescription>
            <Link href="/dashboard">
              <Button size="lg">Return to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
