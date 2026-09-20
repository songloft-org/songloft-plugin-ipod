import { memo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ClickWheel, ViewManager } from "@/components";
import { GlobalStyles } from "@/components/Ipod/GlobalStyles";
import {
  ClickWheelContainer,
  ScreenContainer,
  Shell,
  Sticker,
  Sticker2,
  Sticker3,
} from "@/components/Ipod/Styled";
import {
  AudioPlayerProvider,
  SettingsContext,
  SettingsProvider,
} from "@/hooks";
import ViewContextProvider from "@/providers/ViewContextProvider";

const Ipod = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalStyles />
      <SettingsProvider>
        <ViewContextProvider>
          <AudioPlayerProvider>
            <SettingsContext.Consumer>
              {([{ deviceTheme }]) => (
                <Shell $deviceTheme={deviceTheme}>
                  <Sticker $deviceTheme={deviceTheme} />
                  <Sticker2 $deviceTheme={deviceTheme} />
                  <Sticker3 $deviceTheme={deviceTheme} />
                  <ScreenContainer>
                    <ViewManager />
                  </ScreenContainer>
                  <ClickWheelContainer>
                    <ClickWheel />
                  </ClickWheelContainer>
                </Shell>
              )}
            </SettingsContext.Consumer>
          </AudioPlayerProvider>
        </ViewContextProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
};

export default memo(Ipod);
