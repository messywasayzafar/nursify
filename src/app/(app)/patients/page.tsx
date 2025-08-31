import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function PatientsPage() {
  return (
    <Tabs defaultValue="active">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="discharged">Discharged</TabsTrigger>
          <TabsTrigger value="transfer">Transfer</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="active">
        <Card>
          <CardHeader>
            <CardTitle>Active Patients</CardTitle>
            <CardDescription>
              This section is under construction. A list of active patients will be displayed here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Patient profiles, clinician assignments, and filtering options will be available soon.</p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="discharged">
         <Card>
          <CardHeader>
            <CardTitle>Discharged Patients</CardTitle>
            <CardDescription>
              This section is under construction.
            </CardDescription>
          </CardHeader>
        </Card>
      </TabsContent>
      <TabsContent value="transfer">
         <Card>
          <CardHeader>
            <CardTitle>Transferred Patients</CardTitle>
            <CardDescription>
              This section is under construction.
            </CardDescription>
          </CardHeader>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
