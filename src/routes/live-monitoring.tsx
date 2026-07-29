import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/live-monitoring")({
  component: LiveMonitoring,
});

function LiveMonitoring() {
  const [data, setData] = useState<any>(null);

  async function fetchData() {
    try {
      const res = await fetch(
      "http://65.0.107.129:8000/motor-status"
      )
      const json = await res.json();

      setData(json);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetchData();

    const timer = setInterval(fetchData, 3000);

    return () => clearInterval(timer);
  }, []);

  if (!data) return <h2>Loading...</h2>;

  return (
    <div style={{ padding: 40 }}>
      <h1>Motor Live Monitoring</h1>

      <hr />

      <h2>{data.motor}</h2>

      <h3>Temperature : {data.temperature} °C</h3>

      <h3>Vibration : {data.vibration} mm/s</h3>

      <h3>Current : {data.current} A</h3>

      <h3>Health Score : {data.health}</h3>

      <h3>Status : {data.status}</h3>

      <h3>Updated : {data.timestamp}</h3>
    </div>
  );
}