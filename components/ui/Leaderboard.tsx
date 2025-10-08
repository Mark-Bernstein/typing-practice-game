import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { HighScore } from "../../types/leaderboard";
import { formatDistanceToNow } from "date-fns";

const LeaderboardContainer = styled.div`
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  width: 420px;
  max-height: 70vh;
  background: #000000;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  animation: slideInRight 2s ease-in-out;

  @keyframes slideInRight {
    from {
      transform: translateY(-50%) translateX(500px);
      opacity: 0;
    }
    to {
      transform: translateY(-50%) translateX(0);
      opacity: 1;
    }
  }

  @media (max-width: 1200px) {
    display: none;
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
  transition: all 2s ease;

  &:hover {
    background: ${(props) => {
      if (props.$rank === 1)
        return "linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(245, 158, 11, 0.3) 100%)";
      if (props.$rank === 2)
        return "linear-gradient(135deg, rgba(192, 192, 192, 0.3) 0%, rgba(156, 163, 175, 0.3) 100%)";
      if (props.$rank === 3)
        return "linear-gradient(135deg, rgba(205, 127, 50, 0.3) 0%, rgba(180, 83, 9, 0.3) 100%)";
      return "rgba(255, 255, 255, 0.08)";
    }};
  }
`;

const Rank = styled.div<{ $rank: number }>`
  font-size: 30px;
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
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0px 0px 2px cyan;
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

interface LeaderboardProps {
  refreshTrigger?: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ refreshTrigger }) => {
  const [scores, setScores] = useState<HighScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
          {scores.map((score, index) => {
            const parseDateSafely = (dateStr: string | Date) => {
              const d = new Date(dateStr);
              if (d.getTime() - Date.now() > 5 * 60 * 1000) {
                const offset = d.getTimezoneOffset() * 60000;
                return new Date(d.getTime() - offset);
              }
              return d;
            };

            return (
              <ScoreItem key={score.id} $rank={index + 1}>
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
            );
          })}
        </ScoreList>
      )}
    </LeaderboardContainer>
  );
};
