import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDate = (timestamp, formatDate = 'dd MMM yyyy'): string => {
  return format(new Date(timestamp), formatDate, { locale: ptBR });
};
