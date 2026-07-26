const API =
  "https://oa8s63r1ta.execute-api.ap-south-1.amazonaws.com/prod/motor-data";

export async function getMotorData() {
  const res = await fetch(API);
  return await res.json();
}