import React, { useState } from "react";
import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const Modal = styled.div`
  background: linear-gradient(
    135deg,
    rgba(30, 30, 40, 0.95) 0%,
    rgba(20, 20, 30, 0.95) 100%
  );
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  max-width: 450px;
  width: 90%;
  padding: 40px;
  animation: slideUp 0.4s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(40px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const Title = styled.h2`
  font-size: 32px;
  font-weight: 900;
  text-align: center;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #22d3ee 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  margin-bottom: 32px;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  margin-bottom: 24px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #22d3ee;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 20px rgba(34, 211, 238, 0.3);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const CharCount = styled.div<{ $isNearLimit: boolean }>`
  text-align: right;
  font-size: 14px;
  color: ${(props) =>
    props.$isNearLimit ? "#f87171" : "rgba(255, 255, 255, 0.5)"};
  margin-top: -16px;
  margin-bottom: 16px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button<{ $variant?: "primary" | "secondary" }>`
  flex: 1;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  ${(props) =>
    props.$variant === "primary"
      ? `
    background: linear-gradient(135deg, #22d3ee 0%, #a855f7 100%);
    color: white;
    box-shadow: 0 8px 24px rgba(34, 211, 238, 0.4);

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(34, 211, 238, 0.6);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `
      : `
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);

    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  `}

  &:active {
    transform: translateY(0);
  }
`;

const ErrorMessage = styled.div`
  color: #f87171;
  font-size: 14px;
  text-align: center;
  margin-top: 12px;
`;

interface NicknamePromptProps {
  onSubmit: (nickname: string) => void;
  onSkip: () => void;
  isSubmitting?: boolean;
}

export const NicknamePrompt: React.FC<NicknamePromptProps> = ({
  onSubmit,
  onSkip,
  isSubmitting = false,
}) => {
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const trimmed = nickname.trim();

    if (!trimmed) {
      setError("Please enter a nickname");
      return;
    }

    if (trimmed.length > 20) {
      setError("Nickname must be 20 characters or less");
      return;
    }

    onSubmit(trimmed);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && nickname.trim()) {
      handleSubmit();
    }
  };

  return (
    <Overlay>
      <Modal>
        <Title>🏆 High Score!</Title>
        <Subtitle>Enter your nickname to save your score</Subtitle>

        <Input
          type="text"
          placeholder="Enter nickname..."
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value);
            setError("");
          }}
          onKeyPress={handleKeyPress}
          maxLength={20}
          autoFocus
          disabled={isSubmitting}
        />

        <CharCount $isNearLimit={nickname.length >= 18}>
          {nickname.length}/20
        </CharCount>

        <ButtonGroup>
          <Button $variant="secondary" onClick={onSkip} disabled={isSubmitting}>
            Skip
          </Button>
          <Button
            $variant="primary"
            onClick={handleSubmit}
            disabled={!nickname.trim() || isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Score"}
          </Button>
        </ButtonGroup>

        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Modal>
    </Overlay>
  );
};
