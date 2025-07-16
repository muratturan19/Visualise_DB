import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Textarea,
  Button,
} from "@material-tailwind/react";

export default function ProDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Typography variant="h4" className="mb-4 text-center">
        Visualise DB
      </Typography>
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[18rem_1fr_18rem]">
        <Card className="lg:row-span-2 order-last lg:order-none">
          <CardHeader shadow={false} floated={false} className="p-4">
            <Typography variant="h6">Schema Explorer</Typography>
          </CardHeader>
          <CardBody className="space-y-2">{/* ...schema tree... */}</CardBody>
        </Card>

        <Card>
          <CardHeader shadow={false} floated={false} className="p-4">
            <Typography variant="h6">Sorgu & Sonuç</Typography>
          </CardHeader>
          <CardBody className="space-y-4">
            <Textarea label="Sorunuzu yazın" className="min-h-[100px]" />
            <Button color="blue" className="w-32">Çalıştır</Button>
            <Card className="mt-4">
              <CardBody>{/* tablo veya grafik */}</CardBody>
            </Card>
          </CardBody>
        </Card>

        <Card className="lg:row-span-2 order-last lg:order-none">
          <CardHeader shadow={false} floated={false} className="p-4">
            <Typography variant="h6">History</Typography>
          </CardHeader>
          <CardBody className="space-y-2">{/* ...history list... */}</CardBody>
        </Card>
      </div>
    </div>
  );
}
