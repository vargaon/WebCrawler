import { TimeUnit } from 'src/common/enum/time-unit.enum';

export function getMilliseconds(unit: TimeUnit, value: number): number {
  switch (unit) {
    case TimeUnit.minute:
      return value * 60 * 1000;
    case TimeUnit.hour:
      return value * 60 * 60 * 1000;
    case TimeUnit.day:
      return value * 60 * 60 * 24 * 1000;
  }
}
