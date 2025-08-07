import Alert from "./ValidationAlert";

interface SuccessAlertProps {
  message: string;
  onClose: () => void;
}

export default function SuccessAlert({ message, onClose }: SuccessAlertProps) {
  return (
    <Alert
      type="success"
      title="Sucesso!"
      message={message}
      buttonText="Continuar"
      onClose={onClose}
    />
  );
} 