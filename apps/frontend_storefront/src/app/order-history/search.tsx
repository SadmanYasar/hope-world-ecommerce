import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { searchSchema, SearchSchema } from "./searchSchema";
import { useForm } from "react-hook-form";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";

export function Search({ onSearch }: { onSearch: (query: string) => void }) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty, isSubmitSuccessful },
    watch,
    reset,
  } = useForm<SearchSchema>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: "",
    },
    mode: "onChange",
  });

  // Watch the query field to reset errors when it's valid
  const query = watch("query");

  // Clear error when the input becomes valid
  useEffect(() => {
    if (isValid && error) {
      setError(null);
    }
  }, [isValid, error]);

  // Reset form state after successful submission to enable subsequent submissions
  useEffect(() => {
    if (isSubmitSuccessful) {
      // Reset form state but keep the current values
      reset({ query: query }, { keepValues: true });
    }
  }, [isSubmitSuccessful, reset, query]);

  const onSubmit = (data: SearchSchema) => {
    console.log("Searching for UUID:", data.query);
    onSearch(data.query);
  };

  const handleFormError = () => {
    if (errors.query?.message) {
      setError(errors.query.message as string);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, handleFormError)}>
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Enter UUID to search..."
          {...register("query")}
        />
        <Button variant={"outline"} type="submit">
          Search
        </Button>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </form>
  );
}
