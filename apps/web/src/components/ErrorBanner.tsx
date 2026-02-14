import { FC } from 'react';

export const ErrorBanner: FC<{ message: string }> = ({ message }) => (
  <div style={{ background: '#ffd8d8', color: '#7f0000', padding: 10, borderRadius: 6, marginBottom: 12 }}>{message}</div>
);
