import { ASSETS } from "@/assets";
import styled from "styled-components";

const Container = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  height: 1em;
  -webkit-box-reflect: below 0px -webkit-gradient(linear, left top, left bottom, from(transparent), color-stop(60%, transparent), to(rgba(250, 250, 250, 0.1)));
`;

const ProgressContainer = styled.div`
  position: relative;
  flex: 1;
  margin: 0 8px;
`;

const Gloss = styled.div`
  position: absolute;
  width: 100%;
  background: url("${ASSETS.glossOverlay}") repeat-x;
  background-size: contain;
  height: 100%;
`;

interface ProgressProps {
  $percent: number;
  $isTransparent?: boolean;
}

const Progress = styled.div.attrs<ProgressProps>((props) => ({
  style: { width: `${props.$percent}%` },
}))<ProgressProps>`
  position: relative;
  height: 100%;
  background: ${({ $isTransparent }) =>
    !$isTransparent && `url("${ASSETS.glossBlue}") repeat-x`};
  transition: width 0.1s;
`;

const Diamond = styled.img`
  position: absolute;
  height: 100%;
  right: -8px;
  filter: brightness(0.85);
`;

interface Props {
  percent: number;
  isScrubber?: boolean;
}

const ProgressBar = ({ percent, isScrubber = false }: Props) => (
  <Container>
    <ProgressContainer>
      <Gloss />
      <Progress $percent={percent || 0} $isTransparent={isScrubber}>
        {isScrubber && <Diamond src={ASSETS.scrubber} />}
      </Progress>
    </ProgressContainer>
  </Container>
);

export default ProgressBar;
