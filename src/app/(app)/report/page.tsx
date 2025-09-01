
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ReportPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports</CardTitle>
        <CardDescription>
          Reports can be generated from the 'My Account' menu in the header.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Use the 'Report Center' modal to generate and view various reports for your organization.</p>
      </CardContent>
    </Card>
  );
}
