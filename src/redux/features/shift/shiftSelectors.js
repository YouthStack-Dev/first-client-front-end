// To get all shifts as an array
export const selectAllShifts = (state) =>
  state.shift.shifts.allIds.map((id) => state.shift.shifts.byId[id]);
