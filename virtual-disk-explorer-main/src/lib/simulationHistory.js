const STORAGE_KEY = "vdiskmanager.simulations";

export function readSimulationHistory() {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];

  const simulations = JSON.parse(saved);
  if (!Array.isArray(simulations)) {
    throw new Error("Saved simulation history has an invalid format.");
  }
  return simulations;
}

export function saveSimulation(simulation) {
  const simulations = readSimulationHistory();
  const savedSimulation = {
    ...simulation,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: new Date().toISOString(),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([savedSimulation, ...simulations]));
  return savedSimulation;
}

export function removeSimulation(id) {
  const simulations = readSimulationHistory();
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(simulations.filter((simulation) => simulation.id !== id)),
  );
}

export function clearSimulationHistory() {
  window.localStorage.removeItem(STORAGE_KEY);
}
