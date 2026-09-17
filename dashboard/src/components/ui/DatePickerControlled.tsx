import {Calendar, DateField, DatePicker, Label} from "@heroui/react";
import { useOrderFulfillmentStore } from "@/store/orderFulfillmentStore";

export function Basic() {
  const { startDate, setStartDate } = useOrderFulfillmentStore();

  return (
    <DatePicker 
      className="w-72 h-20" 
      name="date"
      value={startDate}
      onChange={setStartDate}
    >
      <Label className="text-white">Start Date</Label>
      <DateField.Group fullWidth className="bg-surface-raised text-white">
        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        <DateField.Suffix>
          <DatePicker.Trigger>
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      <DatePicker.Popover className="bg-surface-raised border border-white/10">
        <Calendar aria-label="Event date">
          <Calendar.Header>
            <Calendar.YearPickerTrigger>
              <Calendar.YearPickerTriggerHeading />
              <Calendar.YearPickerTriggerIndicator />
            </Calendar.YearPickerTrigger>
            <Calendar.NavButton slot="previous" />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>
              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>{(date) => <Calendar.Cell date={date} className="hover:bg-black hover:text-white" />}</Calendar.GridBody>
          </Calendar.Grid>
          <Calendar.YearPickerGrid>
            <Calendar.YearPickerGridBody>
              {({year}) => <Calendar.YearPickerCell year={year} />}
            </Calendar.YearPickerGridBody>
          </Calendar.YearPickerGrid>
        </Calendar>
      </DatePicker.Popover>
    </DatePicker>
  );
}