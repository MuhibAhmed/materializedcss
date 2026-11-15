import { MaterialIcon } from "@/components/ui/icons";
import { Select, SelectItem } from "@/components/ui/select";

export function SelectIcons() {
  return (
    <div className="grid w-full max-w-xl grid-cols-1 gap-x-6 sm:grid-cols-2">
      <Select label="Transport" defaultValue="car">
        <SelectItem value="car" icon={<MaterialIcon name="directions_car" />}>
          Car
        </SelectItem>
        <SelectItem value="bike" icon={<MaterialIcon name="directions_bike" />}>
          Bike
        </SelectItem>
        <SelectItem value="walk" icon={<MaterialIcon name="directions_walk" />}>
          Walk
        </SelectItem>
      </Select>
      <Select label="Region" variant="outlined" prefix={<MaterialIcon name="public" />}>
        <SelectItem value="eu">Europe</SelectItem>
        <SelectItem value="na">North America</SelectItem>
        <SelectItem value="as">Asia</SelectItem>
      </Select>
    </div>
  );
}
