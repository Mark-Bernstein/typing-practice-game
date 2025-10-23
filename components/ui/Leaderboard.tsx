import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { HighScore } from "../../types/leaderboard";
import { formatDistanceToNow } from "date-fns";

const LeaderboardContainer = styled.div`
  position: absolute;
  right: 16px;
  top: 40px;
  width: 370px;
  max-height: 80vh;
  background: #000000;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 0 40px rgba(183, 0, 255, 0.5);
  overflow: hidden;
  animation: slideInRight 2s ease-in-out;

  @keyframes slideInRight {
    0% {
      transform: translateX(500px);
      opacity: 0;
    }
    60% {
      transform: translateX(-20px);
      opacity: 1;
    }
    80% {
      transform: translateX(10px);
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @media screen and (max-width: 1440px) {
    width: 330px;
  }
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 900;
  margin: 0 0 20px 0;
  text-align: center;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const ScoreList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: calc(70vh - 100px);
  overflow-y: auto;
  padding-right: 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ScoreItem = styled.div<{ $rank: number }>`
  display: flex;
  align-items: center;
  padding-left: 12px;
  background: ${(props) => {
    if (props.$rank === 1)
      return "linear-gradient(0deg, #001aff 0%, #f700ff 100%)";
    if (props.$rank === 2)
      return "linear-gradient(45deg, #91a1ff 0%, #002280 100%)";
    if (props.$rank === 3)
      return "linear-gradient(90deg, rgba(186, 203, 255, 1) 0%, #000000 100%)";
    return "rgba(255, 255, 255, 0.05)";
  }};
  border: 1px solid
    ${(props) => {
      if (props.$rank === 1) return "cyan";
      if (props.$rank === 2) return "limegreen";
      if (props.$rank === 3) return "red";
      return "rgba(255, 255, 255, 0.1)";
    }};
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    cursor: pointer;
    background: rgba(255, 255, 255, 0.08);
  }
`;

const Rank = styled.div<{ $rank: number }>`
  font-size: 24px;
  font-weight: 900;
  min-width: 32px;
  text-align: center;
  color: ${(props) => {
    if (props.$rank === 1) return "#fbbf24";
    if (props.$rank === 2) return "#c0c0c0";
    if (props.$rank === 3) return "#cd7f32";
    return "rgba(255, 255, 255, 0.5)";
  }};
`;

const ScoreInfo = styled.div`
  flex: 1;
  min-width: 0;
  padding: 4px 0;
`;

const Nickname = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0px 0px 2px cyan;

  @media screen and (max-width: 1440px) {
    font-size: 16px;
  }
`;

const ScoreValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: #22d3ee;
  font-family: "SF Mono", monospace;
`;

const Timestamp = styled.div`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
`;

const LoadingState = styled.div`
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  padding: 20px;
  font-size: 14px;
`;

const EmptyState = styled.div`
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  padding: 40px 20px;
  font-size: 14px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #111;
  border-radius: 16px;
  padding: 30px;
  width: 400px;
  max-width: 90%;
  color: #fff;
  box-shadow: 0 0 20px #00fff0, 0 0 40px #ff00ff;
  font-family: "SF Mono", monospace;
`;

const ModalTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 22px;
  color: #0ff;
  text-align: center;
`;

const ModalRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

interface LeaderboardProps {
  refreshTrigger?: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ refreshTrigger }) => {
  const [scores, setScores] = useState<HighScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedScore, setSelectedScore] = useState<HighScore | null>(null);

  const fetchScores = async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await fetch("/api/scores");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setScores(data);
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, [refreshTrigger]);

  const parseDateSafely = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    if (d.getTime() - Date.now() > 5 * 60 * 1000) {
      const offset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - offset);
    }
    return d;
  };

  return (
    <LeaderboardContainer>
      <Title>🏆 High Scores</Title>

      {loading && <LoadingState>Loading scores...</LoadingState>}

      {error && (
        <EmptyState>
          Failed to load scores
          <br />
          <button
            onClick={fetchScores}
            style={{ marginTop: "10px", cursor: "pointer" }}
          >
            Retry
          </button>
        </EmptyState>
      )}

      {!loading && !error && scores.length === 0 && (
        <EmptyState>
          No scores yet!
          <br />
          Be the first to play.
        </EmptyState>
      )}

      {!loading && !error && scores.length > 0 && (
        <ScoreList>
          {scores.map((score, index) => (
            <ScoreItem
              key={score.id}
              $rank={index + 1}
              onClick={() => setSelectedScore(score)}
            >
              <Rank $rank={index + 1}>
                {index + 1 === 1 && "🥇"}
                {index + 1 === 2 && "🥈"}
                {index + 1 === 3 && "🥉"}
                {index + 1 > 3 && `#${index + 1}`}
              </Rank>
              <ScoreInfo>
                <Nickname>{score.nickname}</Nickname>
                <ScoreValue>{score.score.toLocaleString()} pts</ScoreValue>
                <Timestamp>
                  {formatDistanceToNow(parseDateSafely(score.createdAt), {
                    addSuffix: true,
                  })}
                </Timestamp>
              </ScoreInfo>
            </ScoreItem>
          ))}
        </ScoreList>
      )}

      {selectedScore && (
        <ModalOverlay onClick={() => setSelectedScore(null)}>
          <ModalContent>
            <ModalTitle>{selectedScore.nickname}&apos;s Stats</ModalTitle>
            <ModalRow>
              <span>Score:</span>
              <span>{selectedScore.score.toLocaleString()} pts</span>
            </ModalRow>
            <ModalRow>
              <span>Accuracy:</span>
              <span>{selectedScore.accuracy.toFixed(2)}%</span>
            </ModalRow>
            <ModalRow>
              <span>Letters Correct:</span>
              <span>{selectedScore.lettersCorrect}</span>
            </ModalRow>
            <ModalRow>
              <span>Time Played:</span>
              <span>
                {Math.floor(selectedScore.timePlayed / 60)}m{" "}
                {selectedScore.timePlayed % 60}s
              </span>
            </ModalRow>
            <ModalRow>
              <span>Played:</span>
              <span>
                {formatDistanceToNow(parseDateSafely(selectedScore.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </ModalRow>
          </ModalContent>
        </ModalOverlay>
      )}
    </LeaderboardContainer>
  );
};
