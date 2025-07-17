import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Textarea,
  Button,
} from "@material-tailwind/react";
import DataTable from "./components/DataTable";
import ChartView from "./components/ChartView";
import SchemaExplorer from "./components/SchemaExplorer";
import HistoryList from "./components/HistoryList";
import { queryDatabase } from "./api";

function normalizeInput(text) {
  return text.trim().replace(/\s+/g, " ").toLocaleLowerCase("tr-TR");
}

export default function ProDashboard() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const normalizedQuestion = normalizeInput(question);
      const res = await queryDatabase(normalizedQuestion);
      const item = { question: normalizedQuestion, ...res };
      setResult(item);
      setHistory([item, ...history.slice(0, 9)]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
          <CardBody className="space-y-2">
            <SchemaExplorer onSelect={(f) => setQuestion((q) => (q ? q + " " + f : f))} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader shadow={false} floated={false} className="p-4">
            <Typography variant="h6">Sorgu & Sonuç</Typography>
          </CardHeader>
          <CardBody className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-2">
              <Textarea
                label="Sorunuzu yazın"
                className="min-h-[100px]"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <Button type="submit" color="blue" className="w-32" disabled={loading || !question.trim()}>
                {loading ? "Çalışıyor..." : "Çalıştır"}
              </Button>
            </form>
            {error && <Typography color="red">{error}</Typography>}
            {result && (
              <Card className="mt-4">
                <CardBody>
                  {(() => {
                    const tableVis = result.visuals.find((v) => v.type === "table");
                    const chartVis = result.visuals.find((v) => v.type !== "table");
                    const remaining = result.visuals.filter((v) => v !== tableVis && v !== chartVis);

                    const getTitle = (vis) => {
                      if (!vis || vis.type === "table") return "";
                      const yKeys = Array.isArray(vis.y)
                        ? vis.y
                        : (vis.y || "").split(",").map((s) => s.trim());
                      return vis.x && yKeys.length ? `${yKeys.join(", ")} vs ${vis.x}` : "";
                    };

                    const cards = [];

                    if (tableVis && chartVis) {
                      cards.push(
                        <div key="combo" className="space-y-2">
                          <div>
                            {getTitle(chartVis) && (
                              <Typography variant="h6">{getTitle(chartVis)}</Typography>
                            )}
                            <Typography variant="small" className="break-all font-mono">
                              {result.sql}
                            </Typography>
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <ChartView data={chartVis.data} chartType={chartVis.type} x={chartVis.x} y={chartVis.y} />
                            <DataTable data={tableVis.data} />
                          </div>
                        </div>
                      );
                    }

                    cards.push(
                      ...remaining.map((vis, idx) => (
                        <div key={idx} className="space-y-2">
                          {vis.type !== "table" && getTitle(vis) && (
                            <Typography variant="h6">{getTitle(vis)}</Typography>
                          )}
                          <Typography variant="small" className="break-all font-mono">
                            {result.sql}
                          </Typography>
                          {vis.type === "table" ? (
                            <DataTable data={vis.data} />
                          ) : (
                            <ChartView data={vis.data} chartType={vis.type} x={vis.x} y={vis.y} />
                          )}
                        </div>
                      ))
                    );

                    return cards;
                  })()}
                </CardBody>
              </Card>
            )}
          </CardBody>
        </Card>

        <Card className="lg:row-span-2 order-last lg:order-none">
          <CardHeader shadow={false} floated={false} className="p-4">
            <Typography variant="h6">History</Typography>
          </CardHeader>
          <CardBody className="space-y-2">
            <HistoryList items={history} onSelect={(item) => setResult(item)} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
