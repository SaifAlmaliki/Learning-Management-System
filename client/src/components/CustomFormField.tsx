import React from "react";
import {
  ControllerRenderProps,
  FieldValues,
  useFormContext,
  useFieldArray,
} from "react-hook-form";

// UI Components
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// Icons
import { Edit, X, Plus } from "lucide-react";

// FilePond Imports
import { registerPlugin } from "filepond";
import { FilePond } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

// Register FilePond Plugins
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

// ============================
// Interface for CustomFormField
// ============================
interface FormFieldProps {
  name: string;
  label: string;
  type?:
    | "text"
    | "email"
    | "textarea"
    | "number"
    | "select"
    | "switch"
    | "password"
    | "file"
    | "multi-input";
  placeholder?: string;
  options?: { value: string; label: string }[];
  accept?: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  value?: string;
  disabled?: boolean;
  multiple?: boolean;
  isIcon?: boolean;
  initialValue?: string | number | boolean | string[];
}

// ============================
// Custom Form Field Component
// ============================
export const CustomFormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = "text",
  placeholder,
  options,
  accept,
  className,
  inputClassName,
  labelClassName,
  disabled = false,
  multiple = false,
  isIcon = false,
  initialValue,
}) => {
  const { control } = useFormContext();

  // Function to render the appropriate input type
  const renderFormControl = (
    field: ControllerRenderProps<FieldValues, string>
  ) => {
    switch (type) {
      case "textarea":
        return (
          <Textarea
            placeholder={placeholder}
            {...field}
            rows={3}
            className={`border-none bg-customgreys-darkGrey p-4 ${inputClassName}`}
          />
        );

      case "select":
        return (
          <Select
            value={field.value || (initialValue as string)}
            defaultValue={field.value || (initialValue as string)}
            onValueChange={field.onChange}
          >
            <SelectTrigger
              className={`w-full border-none bg-customgreys-primarybg p-4 ${inputClassName}`}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="w-full bg-customgreys-primarybg border-customgreys-dirtyGrey shadow">
              {options?.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="cursor-pointer hover:!bg-gray-100 hover:!text-customgreys-darkGrey"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "switch":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              id={name}
              className={`text-customgreys-dirtyGrey ${inputClassName}`}
            />
            <FormLabel htmlFor={name} className={labelClassName}>
              {label}
            </FormLabel>
          </div>
        );

      case "file":
        return (
          <FilePond
            className={inputClassName}
            files={field.value ? [field.value] : []}
            allowMultiple={multiple}
            onupdatefiles={(fileItems) => {
              field.onChange(
                multiple
                  ? fileItems.map((fileItem) => fileItem.file)
                  : fileItems[0]?.file
              );
            }}
            acceptedFileTypes={accept ? [accept] : ["video/mp4", "video/webm"]}
            labelIdle={`Drag & Drop your files or <span class="filepond--label-action">Browse</span>`}
            credits={false}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            placeholder={placeholder}
            {...field}
            className={`border-none bg-customgreys-darkGrey p-4 ${inputClassName}`}
            disabled={disabled}
          />
        );

      case "multi-input":
        return <MultiInputField name={name} control={control} />;

      default: // Handles "text", "email", "password", etc.
        return (
          <Input
            type={type}
            placeholder={placeholder}
            {...field}
            className={`border-none bg-customgreys-primarybg p-4 ${inputClassName}`}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      defaultValue={initialValue}
      render={({ field }) => (
        <FormItem className={`${type !== "switch" && "rounded-md"} ${className}`}>
          {/* Label Section */}
          {type !== "switch" && (
            <div className="flex justify-between items-center">
              <FormLabel
                className={`text-customgreys-dirtyGrey text-sm ${labelClassName}`}
              >
                {label}
              </FormLabel>
              {isIcon && !disabled && <Edit className="size-4 text-customgreys-dirtyGrey" />}
            </div>
          )}
          {/* Input Section */}
          <FormControl>{renderFormControl(field)}</FormControl>
          {/* Validation Message */}
          <FormMessage className="text-red-400" />
        </FormItem>
      )}
    />
  );
};

// ============================
// MultiInputField Component
// ============================
interface MultiInputFieldProps {
  name: string;
  control: any;
  placeholder?: string;
}

const MultiInputField: React.FC<MultiInputFieldProps> = ({
  name,
  control,
  placeholder,
}) => {
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <div className="space-y-2">
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center space-x-2">
          <FormField
            control={control}
            name={`${name}.${index}`}
            render={({ field }) => (
              <FormControl>
                <Input
                  {...field}
                  placeholder={placeholder}
                  className="flex-1 border-none bg-customgreys-darkGrey p-4"
                />
              </FormControl>
            )}
          />
          {/* Remove Button */}
          <Button
            type="button"
            onClick={() => remove(index)}
            variant="ghost"
            size="icon"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
      {/* Add Item Button */}
      <Button type="button" onClick={() => append("")} variant="outline">
        <Plus className="w-4 h-4 mr-2" />
        Add Item
      </Button>
    </div>
  );
};