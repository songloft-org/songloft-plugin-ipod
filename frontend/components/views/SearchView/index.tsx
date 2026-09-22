import { useCallback, useMemo, useState } from "react";

import { ASSETS } from "@/assets";
import { getConditionalOption } from "@/components/SelectableList";
import SelectableList, { SelectableListOption } from "@/components/SelectableList";
import { useEffectOnce, useKeyboardInput, useSelectableList } from "@/hooks";
import { useFetchSearchResults } from "@/hooks/utils/useDataFetcher";
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
        label: "搜索",
        sublabel: searchTerm ? `“${searchTerm}”的搜索结果` : "输入关键词进行搜索",
        imageUrl: ASSETS.searchIcon,
        onSelect: showKeyboard,
      },
      ...getConditionalOption(Boolean(artists.length), {
        type: "view",
        label: "歌手",
        viewId: "artists",
        props: { artists, inLibrary: false, showImages: true },
        imageUrl: ASSETS.artistsIcon,
        sublabel: `${artists.length} 位歌手`,
      }),
      ...getConditionalOption(Boolean(albums.length), {
        type: "view",
        label: "专辑",
        viewId: "albums",
        props: { albums, inLibrary: false },
        imageUrl: ASSETS.albumsIcon,
        sublabel: `${albums.length} 张专辑`,
      }),
      ...getConditionalOption(Boolean(songs.length), {
        type: "view",
        label: "歌曲",
        viewId: "songs",
        props: { songs },
        imageUrl: ASSETS.songIcon,
        sublabel: `${songs.length} 首歌曲`,
      }),
      ...getConditionalOption(Boolean(playlists.length), {
        type: "view",
        label: "播放列表",
        viewId: "playlists",
        props: { playlists, inLibrary: false },
        imageUrl: ASSETS.playlistIcon,
        sublabel: `${playlists.length} 个播放列表`,
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
      emptyMessage="没有搜索结果"
    />
  );
};

export default SearchView;
