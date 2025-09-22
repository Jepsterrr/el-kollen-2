import { IconType } from 'react-icons';
import { 
    MdOutlineLocalDining, 
    MdLocalLaundryService, 
    MdDryCleaning, 
    MdEvStation,
    MdCleaningServices,
    MdQuestionMark,
    MdMicrowave,
    MdCoffeeMaker,
    MdAcUnit,
    MdPool,
    MdDirectionsCar,
    MdIron
} from 'react-icons/md';
import { PiOven, PiCookingPot, PiPlugCharging, PiSunHorizon } from "react-icons/pi";
import { FaShower } from 'react-icons/fa';
import { TbTemperatureCelsius } from 'react-icons/tb';

export interface AppliancePreset {
  name: string;
  power: number;
  duration: number;
  icon: IconType;
}

// Vår centrala lista med förinställningar
export const APPLIANCE_PRESETS: AppliancePreset[] = [
    { name: 'AC (Portabel)', power: 3.0, duration: 3, icon: MdAcUnit },
    { name: 'Dammsugare', power: 1.0, duration: 0.5, icon: MdCleaningServices },
    { name: 'Diskmaskin', power: 1.5, duration: 2, icon: MdOutlineLocalDining },
    { name: 'Elbilsladdare (11 kW)', power: 11.0, duration: 4, icon: MdEvStation },
    { name: 'Elbilsladdare (22 kW)', power: 22.0, duration: 4, icon: MdEvStation },
    { name: 'Element (litet)', power: 4.0, duration: 4, icon: TbTemperatureCelsius },
    { name: 'Element (stort)', power: 8.0, duration: 4, icon: TbTemperatureCelsius },
    { name: 'Kaffebryggare', power: 0.2, duration: 0.2, icon: MdCoffeeMaker },
    { name: 'Luftavfuktare', power: 2.0, duration: 4, icon: PiSunHorizon },
    { name: 'Matlagningsplatta', power: 1.5, duration: 1, icon: PiCookingPot },
    { name: 'Mikrovågsugn', power: 0.4, duration: 0.2, icon: MdMicrowave },
    { name: 'Motorvärmare', power: 1.0, duration: 2, icon: MdDirectionsCar },
    { name: 'Poolpump', power: 3.0, duration: 4, icon: MdPool },
    { name: 'Slow Cooker', power: 1.2, duration: 6, icon: PiCookingPot },
    { name: 'Strykjärn', power: 1.0, duration: 0.5, icon: MdIron },
    { name: 'Torktumlare', power: 2.5, duration: 2, icon: MdDryCleaning },
    { name: 'Tvättmaskin (40°C)', power: 1.0, duration: 1.5, icon: MdLocalLaundryService },
    { name: 'Tvättmaskin (60°C)', power: 1.5, duration: 2, icon: MdLocalLaundryService },
    { name: 'Ugn', power: 2.0, duration: 1, icon: PiOven },
    { name: 'Varmvattenberedare', power: 3.0, duration: 2, icon: FaShower },
    { name: 'Värmepump (underhåll)', power: 1.0, duration: 1, icon: PiPlugCharging },
].sort((a, b) => a.name.localeCompare(b.name));

// En standardikon vi kan använda om vi inte hittar en match
export const DefaultApplianceIcon = MdQuestionMark;