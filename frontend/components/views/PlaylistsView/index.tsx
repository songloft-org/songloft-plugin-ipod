import { useCallback, useMemo } from "react";

import SelectableList, { SelectableListOption } from "@/components/SelectableList";
import { useSelectableList } from "@/hooks";
import * as Utils from "@/utils";
import { useFetchPlaylists } from "@/hooks/utils/useDataFetcher";

interface Props { playlists?: MediaApi.Playlist[]; inLibrary?: boolean; }
const PlaylistsView = ({ playlists, inLibrary = true }: Props) => {
  const { data: fetchedPlaylists, fetchNextPage, isFetchingNextPage, isLoading } = useFetchPlaylists({ lazy: !!playlists });
  const options: SelectableListOption[] = useMemo(() => (
    playlists ?? fetchedPlaylists?.pages.flatMap((page) => page?.data ?? []) ?? []
  ).map((playlist) => ({
    type: "view", label: playlist.name, sublabel: playlist.description || `By ${playlist.curatorName}`,
    imageUrl: Utils.getArtwork(100, playlist.artwork?.url), viewId: "playlist", headerTitle: playlist.name,
    props: { id: playlist.id, inLibrary }, longPressOptions: Utils.getMediaOptions("playlist", playlist.id),
  })), [fetchedPlaylists, inLibrary, playlists]);
  const handleNearEndOfList = useCallback(() => { if (!isFetchingNextPage) void fetchNextPage(); }, [fetchNextPage, isFetchingNextPage]);
  const { activeIndex } = useSelectableList({ viewId: "playlists", options, onNearEndOfList: handleNearEndOfList });
  return <SelectableList activeIndex={activeIndex} emptyMessage="No saved playlists" loading={isLoading} loadingNextItems={isFetchingNextPage} options={options} />;
};
export default PlaylistsView;
