"use client";

import { Command as CommandPrimitive, useCommandState } from "cmdk";
import { ChevronDown, X } from "lucide-react";
import * as React from "react";
import { forwardRef, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "./label";
import { cn } from "@components/lib/utils";

export interface Option {
  value: string;
  label: string;
  disable?: boolean;
  /** fixed option that can't be removed. */
  fixed?: boolean;
  /** Group the options by providing key. */
  [key: string]: string | boolean | undefined;
}
interface GroupOption {
  [key: string]: Option[];
}

interface MultipleSelectorProps {
  value?: Option[];
  defaultOptions?: Option[];
  /** manually controlled options */
  options?: Option[];
  placeholder?: string;
  label?: string;
  /** Loading component. */
  loadingIndicator?: React.ReactNode;
  /** Empty component. */
  emptyIndicator?: React.ReactNode;
  /** Debounce time for async search. Only work with `onSearch`. */
  delay?: number;
  /**
   * Only work with `onSearch` prop. Trigger search when `onFocus`.
   * For example, when user click on the input, it will trigger the search to get initial options.
   **/
  triggerSearchOnFocus?: boolean;
  /** async search */
  onSearch?: (value: string) => any;
  /**
   * sync search. This search will not showing loadingIndicator.
   * The rest props are the same as async search.
   * i.e.: creatable, groupBy, delay.
   **/
  onSearchSync?: (value: string) => Option[];
  onChange?: (options: Option[]) => void;
  /** Limit the maximum number of selected options. */
  maxSelected?: number;
  /** When the number of selected options exceeds the limit, the onMaxSelected will be called. */
  onMaxSelected?: (maxLimit: number) => void;
  /** Hide the placeholder when there are options selected. */
  hidePlaceholderWhenSelected?: boolean;
  disabled?: boolean;
  /** Group the options base on provided key. */
  groupBy?: string;
  className?: string;
  badgeClassName?: string;
  /**
   * First item selected is a default behavior by cmdk. That is why the default is true.
   * This is a workaround solution by add a dummy item.
   *
   * @reference: https://github.com/pacocoursey/cmdk/issues/171
   */
  selectFirstItem?: boolean;
  /** Allow user to create option when there is no option matched. */
  creatable?: boolean;
  /** Props of `Command` */
  commandProps?: React.ComponentPropsWithoutRef<typeof Command>;
  /** Props of `CommandInput` */
  inputProps?: Omit<
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>,
    "value" | "placeholder" | "disabled"
  >;
  /** hide the clear all button. */
  hideClearAllButton?: boolean;
}

export interface MultipleSelectorRef {
  selectedValue: Option[];
  input: HTMLInputElement;
  focus: () => void;
  reset: () => void;
}

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

function transToGroupOption(options: Option[], groupBy?: string) {
  if (options.length === 0) {
    return {};
  }
  if (!groupBy) {
    return {
      "": options,
    };
  }

  const groupOption: GroupOption = {};
  options.forEach((option) => {
    const key = (option[groupBy] as string) || "";
    if (!groupOption[key]) {
      groupOption[key] = [];
    }
    groupOption[key].push(option);
  });
  return groupOption;
}

function removePickedOption(groupOption: GroupOption, picked: Option[]) {
  const cloneOption = JSON.parse(JSON.stringify(groupOption)) as GroupOption;

  for (const [key, value] of Object.entries(cloneOption)) {
    cloneOption[key] = value.filter(
      (val) => !picked.find((p) => p.value === val.value),
    );
  }
  return cloneOption;
}

function isOptionsExist(groupOption: GroupOption, targetOption: Option[]) {
  for (const [, value] of Object.entries(groupOption)) {
    if (
      value.some((option) => targetOption.find((p) => p.value === option.value))
    ) {
      return true;
    }
  }
  return false;
}

/**
 * The `CommandEmpty` of shadcn/ui will cause the cmdk empty not rendering correctly.
 * So we create one and copy the `Empty` implementation from `cmdk`.
 *
 * @reference: https://github.com/hsuanyi-chou/shadcn-ui-expansions/issues/34#issuecomment-1949561607
 **/
const CommandEmpty = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof CommandPrimitive.Empty>
>(({ className, ...props }, forwardedRef) => {
  const render = useCommandState((state) => state.filtered.count === 0);

  if (!render) return null;

  return (
    <div
      ref={forwardedRef}
      className={cn("py-6 text-sm text-center", className)}
      cmdk-empty=""
      role="presentation"
      {...props}
    />
  );
});

CommandEmpty.displayName = "CommandEmpty";

const MultipleSelector = React.forwardRef<
  MultipleSelectorRef,
  MultipleSelectorProps
>(
  (
    {
      value,
      onChange,
      placeholder,
      label,
      defaultOptions: arrayDefaultOptions = [],
      options: arrayOptions,
      delay,
      onSearch,
      onSearchSync,
      loadingIndicator,
      emptyIndicator,
      maxSelected = Number.MAX_SAFE_INTEGER,
      onMaxSelected,
      hidePlaceholderWhenSelected,
      disabled,
      groupBy,
      className,
      badgeClassName,
      selectFirstItem = true,
      creatable = false,
      triggerSearchOnFocus = false,
      commandProps,
      inputProps,
      hideClearAllButton = false,
    }: MultipleSelectorProps,
    ref: React.Ref<MultipleSelectorRef>,
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [open, setOpen] = React.useState(false);
    const [onScrollbar, setOnScrollbar] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const [hasInitialLoaded, setHasInitialLoaded] = React.useState(false);

    const [selected, setSelected] = React.useState<Option[]>(value || []);
    const [groupOptions, setOptions] = React.useState<GroupOption>(
      transToGroupOption(arrayDefaultOptions, groupBy),
    );
    const [inputValue, setInputValue] = React.useState("");
    const debouncedSearchTerm = useDebounce(inputValue, delay || 500);
    const prevSearchTermRef = React.useRef<string>("");

    React.useImperativeHandle(
      ref,
      () => ({
        selectedValue: [...selected],
        input: inputRef.current as HTMLInputElement,
        focus: () => inputRef?.current?.focus(),
        reset: () => setSelected([]),
      }),
      [selected],
    );

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        inputRef.current.blur();
      }
    };

    const handleUnselect = React.useCallback(
      (option: Option) => {
        const newOptions = selected.filter((s) => s.value !== option.value);
        setSelected(newOptions);
        onChange?.(newOptions);
      },
      [onChange, selected],
    );

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        const input = inputRef.current;
        if (input) {
          if (e.key === "Delete" || e.key === "Backspace") {
            if (input.value === "" && selected.length > 0) {
              const lastSelectOption = selected[selected.length - 1];
              if (!lastSelectOption.fixed) {
                handleUnselect(selected[selected.length - 1]);
              }
            }
          }
          if (e.key === "Escape") {
            input.blur();
          }
        }
      },
      [handleUnselect, selected],
    );

    useEffect(() => {
      if (open) {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchend", handleClickOutside);
      } else {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchend", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchend", handleClickOutside);
      };
    }, [open]);

    useEffect(() => {
      if (value) {
        setSelected(value);
      }
    }, [value]);

    useEffect(() => {
      if (!arrayOptions || onSearch) {
        return;
      }
      const newOption = transToGroupOption(arrayOptions || [], groupBy);
      if (JSON.stringify(newOption) !== JSON.stringify(groupOptions)) {
        setOptions(newOption);
      }
    }, [arrayDefaultOptions, arrayOptions, groupBy, onSearch, groupOptions]);

    useEffect(() => {
      const doSearchSync = () => {
        const res = onSearchSync?.(debouncedSearchTerm);
        setOptions(transToGroupOption(res || [], groupBy));
      };

      const exec = async () => {
        if (!onSearchSync || !open) return;

        if (triggerSearchOnFocus) {
          doSearchSync();
        }

        if (debouncedSearchTerm) {
          doSearchSync();
        }
      };

      void exec();
    }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus]);

    // Add memoized options to prevent unnecessary re-renders
    const memoizedOptions = React.useMemo(
      () => transToGroupOption(arrayOptions || [], groupBy),
      [arrayOptions, groupBy],
    );

    // Update the search effect
    useEffect(() => {
      const doSearch = async () => {
        setIsLoading(true);
        await onSearch?.(debouncedSearchTerm);
        setIsLoading(false);
      };

      const exec = async () => {
        if (!onSearch || !open) return;

        // Handle initial load
        if (triggerSearchOnFocus && !hasInitialLoaded && open) {
          setHasInitialLoaded(true);
          await doSearch();
          return;
        }

        // Handle both text change and empty text cases
        if (prevSearchTermRef.current !== debouncedSearchTerm) {
          prevSearchTermRef.current = debouncedSearchTerm;
          await doSearch();
        }
      };

      void exec();
    }, [
      debouncedSearchTerm,
      open,
      triggerSearchOnFocus,
      onSearch,
      hasInitialLoaded,
    ]);

    // Separate effect for options updates
    useEffect(() => {
      if (!arrayOptions) return;
      setOptions(memoizedOptions);
    }, [memoizedOptions, arrayOptions]);

    const CreatableItem = () => {
      if (!creatable) return undefined;
      if (
        isOptionsExist(groupOptions, [
          { value: inputValue, label: inputValue },
        ]) ||
        selected.find((s) => s.value === inputValue)
      ) {
        return undefined;
      }

      const Item = (
        <CommandItem
          value={inputValue}
          className="cursor-pointer"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onSelect={(value: string) => {
            if (selected.length >= maxSelected) {
              onMaxSelected?.(selected.length);
              return;
            }
            setInputValue("");
            const newOptions = [...selected, { value, label: value }];
            setSelected(newOptions);
            onChange?.(newOptions);
          }}
        >
          {`Create "${inputValue}"`}
        </CommandItem>
      );

      if (!onSearch && inputValue.length > 0) {
        return Item;
      }

      if (onSearch && debouncedSearchTerm.length > 0 && !isLoading) {
        return Item;
      }

      return undefined;
    };

    const EmptyItem = React.useCallback(() => {
      if (!emptyIndicator) return undefined;

      if (onSearch && !creatable && Object.keys(groupOptions).length === 0) {
        return (
          <CommandItem value="-" disabled>
            {emptyIndicator}
          </CommandItem>
        );
      }

      return <CommandEmpty>{emptyIndicator}</CommandEmpty>;
    }, [creatable, emptyIndicator, onSearch, groupOptions]);

    const selectables = React.useMemo<GroupOption>(
      () => removePickedOption(groupOptions, selected),
      [groupOptions, selected],
    );

    const commandFilter = React.useCallback(() => {
      if (commandProps?.filter) {
        return commandProps.filter;
      }

      if (creatable) {
        return (value: string, search: string) => {
          return value.toLowerCase().includes(search.toLowerCase()) ? 1 : -1;
        };
      }
      return undefined;
    }, [creatable, commandProps?.filter]);

    return (
      <div className="flex flex-col gap-2">
        {label && <Label className="text-sm font-ebGaramond">{label}</Label>}
        <Command
          ref={dropdownRef}
          {...commandProps}
          onKeyDown={(e) => {
            handleKeyDown(e);
            commandProps?.onKeyDown?.(e);
          }}
          className={cn(
            "h-auto overflow-visible bg-transparent",
            commandProps?.className,
          )}
          shouldFilter={
            commandProps?.shouldFilter !== undefined
              ? commandProps.shouldFilter
              : !onSearch
          }
          filter={commandFilter()}
        >
          <div
            className={cn(
              "border-b border-primary/70 text-xs py-0.5 relative cursor-pointer",
              {
                "py-2": selected.length !== 0,
                "cursor-text": !disabled && selected.length !== 0,
              },
              className,
            )}
            onClick={() => {
              if (disabled) return;
              inputRef?.current?.focus();
            }}
          >
            <div className="flex relative flex-wrap gap-1">
              {selected.map((option) => {
                return (
                  <Badge
                    key={option.value}
                    className={cn(
                      "data-[disabled]:bg-muted-foreground data-[disabled]:text-muted data-[disabled]:hover:bg-muted-foreground",
                      "data-[fixed]:bg-muted-foreground data-[fixed]:text-muted data-[fixed]:hover:bg-muted-foreground",
                      badgeClassName,
                    )}
                    data-fixed={option.fixed}
                    data-disabled={disabled || undefined}
                  >
                    {option.label}
                    <button
                      className={cn(
                        "ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        (disabled || option.fixed) && "hidden",
                      )}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUnselect(option);
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={() => handleUnselect(option)}
                    >
                      <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </Badge>
                );
              })}
              <CommandPrimitive.Input
                {...inputProps}
                ref={inputRef}
                value={inputValue}
                disabled={disabled}
                onValueChange={(value) => {
                  setInputValue(value);
                  inputProps?.onValueChange?.(value);
                }}
                onBlur={(event) => {
                  if (!onScrollbar) {
                    setOpen(false);
                  }
                  inputProps?.onBlur?.(event);
                }}
                onFocus={(event) => {
                  setOpen(true);
                  triggerSearchOnFocus && onSearch?.(debouncedSearchTerm);
                  inputProps?.onFocus?.(event);
                }}
                placeholder={
                  hidePlaceholderWhenSelected && selected.length !== 0
                    ? ""
                    : placeholder
                }
                className={cn(
                  "flex-1 bg-transparent outline-none placeholder:text-muted-foreground cursor-pointer",
                  {
                    "w-full": hidePlaceholderWhenSelected,
                    "py-2": selected.length === 0,
                    "ml-1": selected.length !== 0,
                  },
                  inputProps?.className,
                )}
              />
              {/* <button
                type="button"
                onClick={() => {
                  setSelected(selected.filter((s) => s.fixed));
                  onChange?.(selected.filter((s) => s.fixed));
                }}
                className={cn(
                  "absolute right-0 h-6 w-6 p-0",
                  (hideClearAllButton ||
                    disabled ||
                    selected.length < 1 ||
                    selected.filter((s) => s.fixed).length ===
                      selected.length) &&
                    "hidden",
                )}
              >
                <X />
              </button> */}
            </div>
            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2" />
          </div>
          <div className="relative">
            {open && (
              <CommandList
                className="absolute top-1 z-10 w-full rounded-md border shadow-md outline-none bg-popover text-popover-foreground animate-in"
                onMouseLeave={() => {
                  setOnScrollbar(false);
                }}
                onMouseEnter={() => {
                  setOnScrollbar(true);
                }}
                onMouseUp={() => {
                  inputRef?.current?.focus();
                }}
              >
                {isLoading ? (
                  <>{loadingIndicator}</>
                ) : (
                  <>
                    {EmptyItem()}
                    {CreatableItem()}
                    {!selectFirstItem && (
                      <CommandItem value="-" className="hidden" />
                    )}
                    {Object.entries(selectables).map(([key, dropdowns]) => (
                      <CommandGroup
                        key={key}
                        heading={key}
                        className="overflow-auto h-full"
                      >
                        <>
                          {dropdowns.map((option) => {
                            return (
                              <CommandItem
                                key={option.value}
                                value={option.value}
                                disabled={option.disable}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onSelect={() => {
                                  if (selected.length >= maxSelected) {
                                    onMaxSelected?.(selected.length);
                                    return;
                                  }
                                  setInputValue("");
                                  const newOptions = [...selected, option];
                                  setSelected(newOptions);
                                  onChange?.(newOptions);
                                }}
                                className={cn(
                                  "cursor-pointer text-xs",
                                  option.disable &&
                                    "cursor-default text-muted-foreground",
                                )}
                              >
                                {option.label}
                              </CommandItem>
                            );
                          })}
                        </>
                      </CommandGroup>
                    ))}
                  </>
                )}
              </CommandList>
            )}
          </div>
        </Command>
      </div>
    );
  },
);

MultipleSelector.displayName = "MultipleSelector";
export default MultipleSelector;