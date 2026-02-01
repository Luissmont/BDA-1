import { z } from 'zod';

export type CategoryPerformance = {
  categoria: string;
  totalProductos: number;  
  stockTotal: number;      
  valorInventario: number; 
  precioPromedio: number;  
};

export type VipClient = {
  cliente: string;
  totalOrdenes: number;
  totalGastado: number;
  nivelCliente: 'Platinum' | 'Gold' | 'Silver'; 
};


export const SearchParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  query: z.string().optional(),
});