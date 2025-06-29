import { PricingTable } from "@clerk/nextjs";
import { Card, CardContent } from "@/components/ui/card";

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Unlock the full potential of your flashcard learning experience with
          our flexible pricing options
        </p>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-0">
          <PricingTable />
        </CardContent>
      </Card>

      <div className="text-center mt-12">
        <p className="text-sm text-muted-foreground">
          All plans include secure data storage and cross-device synchronization
        </p>
      </div>
    </div>
  );
}
