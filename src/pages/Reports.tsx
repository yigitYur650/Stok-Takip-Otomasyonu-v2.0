import React from 'react';
import { PageTransition } from '../components/PageTransition';
import { BarChart as BarChartIcon } from 'lucide-react';

export function Reports() {
  return (
    <PageTransition className="flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto bg-purple-100 text-purple-500 w-20 h-20 flex items-center justify-center rounded-3xl mb-6 shadow-xl shadow-purple-500/20">
          <BarChartIcon size={40} />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-3">Gelişmiş Raporlar</h1>
        <p className="text-slate-500 max-w-md mx-auto">Muhasebe ve envanter analizleriniz PDF ve Excel formatında burada raporlanacak.</p>
      </div>
    </PageTransition>
  );
}
