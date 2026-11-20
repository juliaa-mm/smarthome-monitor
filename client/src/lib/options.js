import { unitLabel } from './format';

export const houseOptions = {
  optionsUrl: '/houses', optionValue: 'house_id', optionLabel: (r) => `${r.name} (${r.city})`,
};
export const roomOptions = {
  optionsUrl: '/rooms', optionValue: 'room_id', optionLabel: (r) => r.name, optionHint: (r) => r.house_name,
};
export const typeOptions = {
  optionsUrl: '/device-types', optionValue: 'type_id', optionLabel: (r) => r.name,
};
export const deviceOptions = {
  optionsUrl: '/devices', optionValue: 'device_id', optionLabel: (r) => r.name, optionHint: (r) => `${r.room_name}, ${r.house_name}`,
};
export const parameterOptions = {
  optionsUrl: '/parameters', optionValue: 'parameter_id', optionLabel: (r) => r.name, optionHint: (r) => unitLabel(r.unit),
};
export const eventTypeOptions = {
  optionsUrl: '/event-types', optionValue: 'event_type_id', optionLabel: (r) => r.name,
};
export const scenarioOptions = {
  optionsUrl: '/scenarios', optionValue: 'scenario_id', optionLabel: (r) => r.name,
};
export const sensorOptions = {
  optionsUrl: '/device-parameters', optionValue: 'device_parameter_id', optionLabel: (r) => r.device_name, optionHint: (r) => `${r.parameter_name}, ${unitLabel(r.unit)} · ${r.room_name}`,
  optionGroup: (r) => r.house_name, searchable: true,
};
