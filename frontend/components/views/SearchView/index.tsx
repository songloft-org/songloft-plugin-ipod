import { useCallback, useMemo, useState } from "react";

import { ASSETS } from "@/assets";
import { getConditionalOption } from "@/components/SelectableList";
import SelectableList, { SelectableListOption } from "@/components/SelectableList";
import { useEffectOnce, useKeyboardInput, useSelectableList } from "@/hooks";
import { useFetchSearchResults } from "@/hooks/utils/useDataFetcher";
import { pluralize } from "@/utils/strings";

const SearchView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { refetch, data: searchResults, isFetching } = useFetchSearchResults({
    query: searchTerm,
    lazy: true,
  });
  const handleEnterPress = useCallback(() => {
    if (searchTerm) void refetch();
  }, [refetch, searchTerm]);
  const { showKeyboard } = useKeyboardInput({
    onChange: setSearchTerm,
    onEnterPress: handleEnterPress,
  });

  const options: SelectableListOption[] = useMemo(() => {
    const { artists = [], albums = [], songs = [], playlists = [] } = searchResults ?? {};

    return [
      {
        type: "action" as const,
        label: "Search",
        sublabel: searchTerm ? `Results for: ${searchTerm}` : "Enter text to search",
        imageUrl: ASSETS.searchIcon,
        onSelect: showKeyboard,
      },
      ...getConditionalOption(Boolean(artists.length), {
        type: "view",
        label: "Artists",
        viewId: "artists",
        props: { artists, inLibrary: false, showImages: true },
        imageUrl: ASSETS.artistsIcon,
        sublabel: `${artists.length} ${pluralize("artist", "artists", artists.length)}`,
      }),
      ...getConditionalOption(Boolean(albums.length), {
        type: "view",
        label: "Albums",
        viewId: "albums",
        props: { albums, inLibrary: false },
        imageUrl: ASSETS.albumsIcon,
        sublabel: `${albums.length} ${pluralize("album", "albums", albums.length)}`,
      }),
      ...getConditionalOption(Boolean(songs.length), {
        type: "view",
        label: "Songs",
        viewId: "songs",
        props: { songs },
        imageUrl: ASSETS.songIcon,
        sublabel: `${songs.length} ${pluralize("song", "songs", songs.length)}`,
      }),
      ...getConditionalOption(Boolean(playlists.length), {
        type: "view",
        label: "Playlists",
        viewId: "playlists",
        props: { playlists, inLibrary: false },
        imageUrl: ASSETS.playlistIcon,
        sublabel: `${playlists.length} ${pluralize("playlist", "playlists", playlists.length)}`,
      }),
    ];
  }, [searchResults, searchTerm, showKeyboard]);

  useEffectOnce(showKeyboard);
  const { activeIndex } = useSelectableList({ viewId: "search", options });

  return (
    <SelectableList
      loading={isFetching}
      options={options}
      activeIndex={activeIndex}
      emptyMessage="No results"
    />
  );
};

export default SearchView;
