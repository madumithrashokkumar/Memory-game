"use client";

export function useLMSBridge() {
  const reportComplete = (data: { points: number }) => {
    console.log("Lab Completed:", data);
  };
  return { reportComplete };
}
