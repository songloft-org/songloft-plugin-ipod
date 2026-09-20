import { useCallback, useMemo } from "react";

import SelectableList, { SelectableListOption } from "@/components/SelectableList";
import { useSelectableList } from "@/hooks";
import * as Utils from "@/utils";
import { useFetchAlbums } from "@/hooks/utils/useDataFetcher";

interface Props { albums?: MediaApi.Album[]; inLibrary?: boolean; }

const AlbumsView = ({ albums, inLibrary = true }: Props) => {
  const { data: fetchedAlbums, fetchNextPage, isFetchingNextPage, isLoading } = useFetchAlbums({ lazy: !!albums });
  const options: SelectableListOption[] = useMemo(() => (
    albums ?? fetchedAlbums?.pages.flatMap((page) => page?.data ?? []) ?? []
  ).map((album) => ({
    type: "view", headerTitle: album.name, label: album.name,
    sublabel: album.artistName, imageUrl: Utils.getArtwork(300, album.artwork?.url),
    viewId: "album", props: { id: album.id, inLibrary },
  })), [albums, fetchedAlbums, inLibrary]);
  const handleNearEndOfList = useCallback(() => { if (!isFetchingNextPage) void fetchNextPage(); }, [fetchNextPage, isFetchingNextPage]);
  const { activeIndex } = useSelectableList({ viewId: "albums", options, onNearEndOfList: handleNearEndOfList });
  return <SelectableList loading={isLoading} loadingNextItems={isFetchingNextPage} options={options} activeIndex={activeIndex} emptyMessage="No albums" />;
};
export default AlbumsView;
