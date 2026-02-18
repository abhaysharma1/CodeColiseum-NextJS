"use client";
import * as React from "react";
import { Autocomplete } from "@base-ui/react/autocomplete";

interface Group {
  id: string;
  name: string;
  description: string | null;
  creatorId: string;
  noOfMembers: number;
  joinByLink: boolean;
  createdAt: Date;
}

interface AutoCompleteSearchBarProps {
  groups: Group[];
  setSearchedGroup: React.Dispatch<React.SetStateAction<Group | undefined>>;
}

export default function AutoCompleteSearchBar({
  groups,
  setSearchedGroup,
}: AutoCompleteSearchBarProps) {
  const [searchValue, setSearchValue] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<Group[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const { contains } = Autocomplete.useFilter({ sensitivity: "base" });

  React.useEffect(() => {
    if (!searchValue) {
      setSearchResults([]);
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);
    setError(null);

    let ignore = false;

    async function fetchGroups() {
      try {
        const results = await searchGroups(searchValue, contains, groups);
        if (!ignore) {
          setSearchResults(results);
        }
      } catch (err) {
        if (!ignore) {
          setError("Failed to fetch groups. Please try again.");
          setSearchResults([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    const timeoutId = setTimeout(fetchGroups, 300);

    return () => {
      clearTimeout(timeoutId);
      ignore = true;
    };
  }, [searchValue, contains, groups]);

  let status: React.ReactNode = `${searchResults.length} result${searchResults.length === 1 ? "" : "s"} found`;
  if (isLoading) {
    status = (
      <React.Fragment>
        <div
          className="size-4 rounded-full border-2 border-muted border-t-foreground animate-spin"
          aria-hidden
        />
        Searching...
      </React.Fragment>
    );
  } else if (error) {
    status = error;
  } else if (searchResults.length === 0 && searchValue) {
    status = `Group "${searchValue}" not found`;
  }

  const shouldRenderPopup = searchValue !== "";

  return (
    <Autocomplete.Root
      items={searchResults}
      value={searchValue}
      onValueChange={setSearchValue}
      itemToStringValue={(item) => item.name}
      filter={null}
    >
      <label className="flex flex-col gap-1 text-sm leading-5 font-medium text-foreground">
        <Autocomplete.Input
          placeholder="Search Groups"
          className="h-10 my-3 w-[16rem] md:w-[20rem] font-normal rounded-md border border-input bg-background px-3 text-base text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </label>

      {shouldRenderPopup && (
        <Autocomplete.Portal>
          <Autocomplete.Positioner
            className="outline-none"
            sideOffset={4}
            align="start"
          >
            <Autocomplete.Popup
              className="w-[var(--anchor-width)] max-h-[min(var(--available-height),23rem)] max-w-[var(--available-width)] overflow-y-auto scroll-pt-2 scroll-pb-2 overscroll-contain rounded-md border border-border bg-popover py-2 text-popover-foreground shadow-md z-50"
              aria-busy={isLoading || undefined}
            >
              <Autocomplete.Status className="flex items-center gap-2 py-1 pl-4 pr-8 text-sm text-muted-foreground">
                {status}
              </Autocomplete.Status>
              <Autocomplete.List>
                {(group: Group) => (
                  <Autocomplete.Item
                    key={group.id}
                    className="flex cursor-default py-2 pr-8 pl-4 text-base leading-4 outline-none select-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground rounded-sm mx-2"
                    value={group}
                    onClick={() => {
                      setSearchedGroup(group);
                    }}
                  >
                    <div className="flex w-full flex-col gap-1">
                      <div className="font-medium leading-5">{group.name}</div>
                      {group.description && (
                        <div className="text-sm leading-4 text-muted-foreground">
                          {group.description}
                        </div>
                      )}
                    </div>
                  </Autocomplete.Item>
                )}
              </Autocomplete.List>
            </Autocomplete.Popup>
          </Autocomplete.Positioner>
        </Autocomplete.Portal>
      )}
    </Autocomplete.Root>
  );
}

async function searchGroups(
  query: string,
  filter: (item: string, query: string) => boolean,
  groups: Group[]
): Promise<Group[]> {
  return groups.filter(
    (group) =>
      filter(group.name, query) ||
      (group.description && filter(group.description, query))
  );
}
