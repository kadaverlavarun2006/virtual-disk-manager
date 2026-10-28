import { afterEach, describe, expect, it } from "vitest";
import { clearSimulationHistory, readSimulationHistory, removeSimulation, saveSimulation } from "@/lib/simulationHistory";

afterEach(() => {
  window.localStorage.clear();
});

describe("simulation history", () => {
  it("saves runs and reads newest first", () => {
    const first = saveSimulation({ algorithm: "fcfs", totalSeekTime: 20 });
    const second = saveSimulation({ algorithm: "sstf", totalSeekTime: 10 });

    expect(readSimulationHistory().map((simulation) => simulation.id)).toEqual([second.id, first.id]);
    expect(second.createdAt).toBeTruthy();
  });

  it("removes one run without affecting the others", () => {
    const first = saveSimulation({ algorithm: "fcfs" });
    const second = saveSimulation({ algorithm: "sstf" });

    removeSimulation(first.id);

    expect(readSimulationHistory()).toEqual([second]);
  });

  it("clears all saved runs", () => {
    saveSimulation({ algorithm: "fcfs" });

    clearSimulationHistory();

    expect(readSimulationHistory()).toEqual([]);
  });

  it("reports invalid stored history rather than hiding the problem", () => {
    window.localStorage.setItem("vdiskmanager.simulations", "{");

    expect(readSimulationHistory).toThrow();
  });
});
