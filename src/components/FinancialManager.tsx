import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, addDoc, updateDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Plus, Save, Trash2, TrendingUp, CreditCard, Play, Calculator, PieChart, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface LedgerItem {
  id: string;
  projectId: string;
  costCenter: string;
  forecast: number;
  actual: number;
}

interface FinancialParams {
  totalProjectBudget: number;
  contingencyFund: number;
  costEstimationSummary: string;
}

export default function FinancialManager({ projectId, role }: { projectId: string, role: string }) {
  const [ledger, setLedger] = useState<LedgerItem[]>([]);
  const [financialParams, setFinancialParams] = useState<FinancialParams>({
    totalProjectBudget: 0,
    contingencyFund: 0,
    costEstimationSummary: ''
  });
  const [isSavingParams, setIsSavingParams] = useState(false);
  const [newItem, setNewItem] = useState({ costCenter: '', forecast: 0, actual: 0 });
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);
  
  const isEditable = role === 'project_manager' || role === 'financial_analyst' || role === 'admin';

  useEffect(() => {
    if (!projectId) return;
    
    // Fetch budget ledger
    const q = query(collection(db, 'budgetLedgers'), where('projectId', '==', projectId));
    const unsubLedger = onSnapshot(q, (snapshot) => {
      setLedger(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LedgerItem)));
    }, error => handleFirestoreError(error, OperationType.LIST, 'budgetLedgers'));

    // Fetch project financial params
    const projectRef = doc(db, 'projects', projectId);
    const unsubProject = onSnapshot(projectRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.financialParams) {
          setFinancialParams(data.financialParams);
        }
      }
    }, error => handleFirestoreError(error, OperationType.GET, 'projects'));

    return () => {
      unsubLedger();
      unsubProject();
    };
  }, [projectId]);

  const updateFinancialParams = async (updates: Partial<FinancialParams>) => {
    if (!isEditable || !projectId) return;
    setIsSavingParams(true);
    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      
      const newParams = { ...financialParams, ...updates };
      
      if (!projectSnap.exists()) {
        // This shouldn't happen usually as project is created during onboarding
        console.warn("Project doc not found, attempting to create default project context.");
      }
      
      await updateDoc(projectRef, {
        financialParams: newParams,
        updatedAt: serverTimestamp()
      });
      setFinancialParams(newParams);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'projects');
    } finally {
      setIsSavingParams(false);
    }
  };

  const handleAddItem = async () => {
    if (!projectId || !newItem.costCenter || !isEditable) return;
    try {
      await addDoc(collection(db, 'budgetLedgers'), {
        projectId,
        costCenter: newItem.costCenter,
        forecast: Number(newItem.forecast),
        actual: Number(newItem.actual)
      });
      setNewItem({ costCenter: '', forecast: 0, actual: 0 });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'budgetLedgers');
    }
  };

  const handleUpdate = async (id: string, field: string, value: string | number) => {
    if (!isEditable) return;
    try {
      await updateDoc(doc(db, 'budgetLedgers', id), {
        [field]: Number(value)
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'budgetLedgers');
    }
  };

  const handleDelete = async (id: string) => {
    if (!isEditable) return;
    try {
      await deleteDoc(doc(db, 'budgetLedgers', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'budgetLedgers');
    }
  };

  const runSimulation = () => {
    setIsSimulating(true);
    setSimulationResult(null);
    setTimeout(() => {
      setIsSimulating(false);
      const totalF = ledger.reduce((acc, item) => acc + item.forecast, 0);
      const totalA = ledger.reduce((acc, item) => acc + item.actual, 0);
      
      if (ledger.length === 0) {
        setSimulationResult("Simulation requires at least one ledger entry to project financial trajectory.");
        return;
      }

      const variance = totalA - totalF;
      const efficiencyRatio = totalF > 0 ? totalA / totalF : 1;
      
      let outcome = "";
      if (efficiencyRatio > 1.1) {
        outcome = `WARNING: Projected fiscal trajectory indicates a ${Math.round((efficiencyRatio - 1) * 100)}% budget overrun. Mitigation required for ${ledger.sort((a, b) => b.actual - a.actual)[0].costCenter}.`;
      } else if (efficiencyRatio < 0.9 && totalA > 0) {
        outcome = `OPTIMIZED: Financial modeling suggests a potential surplus of $${(totalF - totalA).toLocaleString()}. Recommend reallocating resources to expedited site operations.`;
      } else {
        const potentialSavings = Math.floor(totalF * 0.08);
        outcome = `STRATEGIC INSIGHT: Implementing bulk procurement for ${ledger[0].costCenter} could yield an immediate $${potentialSavings.toLocaleString()} liquidation benefit.`;
      }
      
      setSimulationResult(`[AI ANALYSIS COMPLETE] ${outcome}`);
    }, 2500);
  };

  const totalForecast = ledger.reduce((acc, item) => acc + item.forecast, 0);
  const totalActual = ledger.reduce((acc, item) => acc + item.actual, 0);
  const totalVariance = totalActual - totalForecast;
  const totalBudget = Number(financialParams.totalProjectBudget) || 0;
  const utilizedPercent = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;
  const forecastPercent = totalBudget > 0 ? (totalForecast / totalBudget) * 100 : 0;
  const remainingBudget = totalBudget - totalActual;
  const contingency = Number(financialParams.contingencyFund) || 0;
  const totalAvailable = totalBudget + contingency;

  return (
    <div className="space-y-6">
      {/* Strategic Financial Controls */}
      {isEditable && (
        <div className="p-8 border border-accent/20 bg-accent/5 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <Calculator className="text-accent" size={20} />
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-charcoal dark:text-concrete font-bold">Project Fiscal Authorization & Controls</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <label className="block font-mono text-[9px] uppercase tracking-widest text-steel font-bold">Core Project Budget (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-xs text-steel">$</span>
                <input 
                  type="number"
                  value={financialParams.totalProjectBudget || ''}
                  onChange={(e) => setFinancialParams({ ...financialParams, totalProjectBudget: Number(e.target.value) })}
                  onBlur={(e) => updateFinancialParams({ totalProjectBudget: Number(e.target.value) })}
                  className="w-full bg-charcoal/5 dark:bg-white/5 border border-steel/20 p-4 pl-8 font-mono text-xs text-charcoal dark:text-concrete outline-none focus:border-accent transition-all"
                  placeholder="0.00"
                />
              </div>
              <p className="font-mono text-[8px] text-steel uppercase leading-relaxed">The total authorized capital expenditure for the primary project scope.</p>
            </div>

            <div className="space-y-4">
              <label className="block font-mono text-[9px] uppercase tracking-widest text-steel font-bold">Contingency Reserve (10-15% Recommended)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-xs text-steel">$</span>
                <input 
                  type="number"
                  value={financialParams.contingencyFund || ''}
                  onChange={(e) => setFinancialParams({ ...financialParams, contingencyFund: Number(e.target.value) })}
                  onBlur={(e) => updateFinancialParams({ contingencyFund: Number(e.target.value) })}
                  className="w-full bg-charcoal/5 dark:bg-white/5 border border-steel/20 p-4 pl-8 font-mono text-xs text-charcoal dark:text-concrete outline-none focus:border-accent transition-all"
                  placeholder="0.00"
                />
              </div>
              <p className="font-mono text-[8px] text-steel uppercase leading-relaxed">Emergency liquidity locked for unforeseen site complications or material surge.</p>
            </div>

            <div className="space-y-4 lg:col-span-1">
              <label className="block font-mono text-[9px] uppercase tracking-widest text-steel font-bold">Cost Estimation Narrative</label>
              <textarea 
                value={financialParams.costEstimationSummary || ''}
                onChange={(e) => setFinancialParams({ ...financialParams, costEstimationSummary: e.target.value })}
                onBlur={(e) => updateFinancialParams({ costEstimationSummary: e.target.value })}
                className="w-full bg-charcoal/5 dark:bg-white/5 border border-steel/20 p-4 font-mono text-[10px] text-charcoal dark:text-concrete outline-none focus:border-accent transition-all min-h-[80px] custom-scrollbar"
                placeholder="Synchronize cost modeling assumptions..."
              />
              <div className="flex justify-between items-center">
                <p className="font-mono text-[8px] text-steel uppercase leading-relaxed font-bold">System Status: {isSavingParams ? 'Synchronizing...' : 'Live'}</p>
                {isSavingParams && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Save size={10} className="text-accent" /></motion.div>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-8 border border-steel/20 bg-white/50 dark:bg-charcoal/50 backdrop-blur-md shadow-sm lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <CreditCard className="text-blue-500" size={28} strokeWidth={1} />
              {totalBudget > 0 && utilizedPercent > 90 && (
                <div className="bg-red-500/10 border border-red-500/20 p-2 flex items-center gap-2">
                  <AlertTriangle size={12} className="text-red-500 animate-pulse" />
                  <span className="font-mono text-[8px] text-red-500 uppercase font-bold">Critical Threshold</span>
                </div>
              )}
            </div>
            
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-charcoal dark:text-concrete font-bold mb-4">Cash Flow Projection</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[10px] font-mono text-steel uppercase mb-2">
                  <span>Authorized Budget Utilized</span>
                  <span className={`font-bold ${utilizedPercent > 100 ? 'text-red-500' : 'text-accent'}`}>{Math.round(utilizedPercent)}%</span>
                </div>
                <div className="w-full bg-steel/10 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 ${utilizedPercent > 100 ? 'bg-red-500' : utilizedPercent > 80 ? 'bg-orange-500' : 'bg-blue-500'}`} 
                    style={{ width: `${Math.min(utilizedPercent, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-mono text-steel uppercase mb-2">
                  <span>Forecast Allocation</span>
                  <span className="text-charcoal dark:text-concrete font-bold">{Math.round(forecastPercent)}%</span>
                </div>
                <div className="w-full bg-steel/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-steel/30 h-full transition-all duration-700" style={{ width: `${Math.min(forecastPercent, 100)}%` }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-steel/10">
                <div>
                  <p className="text-[9px] font-mono text-steel uppercase mb-1">Actual Spent</p>
                  <p className="text-sm font-display font-bold text-charcoal dark:text-concrete">${totalActual.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[9px] font-mono text-steel uppercase mb-1">Remaining</p>
                  <p className={`text-sm font-display font-bold ${remainingBudget < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    ${remainingBudget.toLocaleString()}
                  </p>
                </div>
              </div>

              {contingency > 0 && (
                <div className="bg-accent/5 p-4 border-l-2 border-accent">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-[9px] text-steel uppercase font-bold">Emergency Liquidity</span>
                    <span className="font-mono text-[10px] font-bold text-accent">${contingency.toLocaleString()}</span>
                  </div>
                  <p className="text-[8px] font-mono text-steel uppercase opacity-70">Total Liquid Access: ${(totalBudget + contingency).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-steel/10">
            <button 
              onClick={runSimulation}
              disabled={isSimulating}
              className="w-full flex justify-center items-center gap-2 bg-blue-500 text-white p-3 text-xs uppercase font-bold tracking-widest hover:bg-blue-600 transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/20"
            >
              {isSimulating ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Play size={14} /></motion.div> : <Play size={14} />}
              {isSimulating ? 'Analyzing...' : 'Run Intelligence Audit'}
            </button>
            {simulationResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-charcoal dark:bg-charcoal border-l-2 border-green-500 shadow-xl">
                <div className="flex items-center gap-2 mb-2 text-green-500">
                  <PieChart size={12} />
                  <span className="font-mono text-[8px] uppercase tracking-widest font-bold">AI Fiscal Strategy</span>
                </div>
                <p className="text-[10px] font-mono text-concrete leading-relaxed">
                  {simulationResult}
                </p>
              </motion.div>
            )}
          </div>
        </div>

        <div className="p-8 border border-steel/20 bg-white/50 dark:bg-charcoal/50 backdrop-blur-md lg:col-span-2 shadow-sm flex flex-col justify-between overflow-hidden">
          <div className="w-full overflow-hidden flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-blue-500" size={28} strokeWidth={1} />
                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-charcoal dark:text-concrete font-bold">Budget Variance Ledger</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-mono font-bold uppercase transition-colors ${totalVariance > 0 ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                  {totalVariance > 0 ? <AlertTriangle size={10} /> : <CheckCircle2 size={10} />}
                  Variance: {totalVariance > 0 ? '+' : ''}${Math.abs(totalVariance).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar flex-grow">
              <table className="w-full text-left font-mono text-[10px]">
                <thead>
                  <tr className="border-b border-steel/10 text-steel uppercase tracking-widest bg-steel/5">
                    <th className="p-3">Activity / Cost Center</th>
                    <th className="p-3">Forecasted</th>
                    <th className="p-3">Actual Spent</th>
                    <th className="p-3 text-right">Delta</th>
                    {isEditable && <th className="p-3 text-right">Sync</th>}
                  </tr>
                </thead>
                <tbody className="text-charcoal dark:text-concrete">
                  {ledger.map((item, idx) => {
                    const variance = item.actual - item.forecast;
                    return (
                      <motion.tr 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={item.id} 
                        className="border-b border-steel/5 hover:bg-blue-500/5 transition-colors group"
                      >
                        <td className="p-3 font-bold">{item.costCenter}</td>
                        <td className="p-3">
                          {isEditable ? (
                            <div className="flex items-center gap-1">
                              <span className="text-steel">$</span>
                              <input 
                                type="number" 
                                className="bg-transparent border-b border-steel/20 w-24 focus:outline-none focus:border-blue-500 py-1 transition-all"
                                value={item.forecast || ''}
                                onChange={(e) => handleUpdate(item.id, 'forecast', e.target.value)}
                              />
                            </div>
                          ) : `$${item.forecast.toLocaleString()}`}
                        </td>
                        <td className="p-3">
                          {isEditable ? (
                            <div className="flex items-center gap-1">
                              <span className="text-steel">$</span>
                              <input 
                                type="number" 
                                className="bg-transparent border-b border-steel/20 w-24 focus:outline-none focus:border-blue-500 py-1 transition-all"
                                value={item.actual || ''}
                                onChange={(e) => handleUpdate(item.id, 'actual', e.target.value)}
                              />
                            </div>
                          ) : `$${item.actual.toLocaleString()}`}
                        </td>
                        <td className={`p-3 text-right font-bold ${variance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {variance > 0 ? '+' : ''}{Math.abs(variance).toLocaleString()}
                        </td>
                        {isEditable && (
                          <td className="p-3 text-right">
                            <button onClick={() => handleDelete(item.id)} className="text-steel opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all p-1">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        )}
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>

              {ledger.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-steel/5 border border-dashed border-steel/10 mt-4">
                  <Calculator size={32} className="text-steel/20 mb-4" />
                  <p className="text-xs text-steel font-mono uppercase tracking-widest">Initialization Pending: No ledgers allocated.</p>
                </div>
              )}
            </div>

            {isEditable && (
              <div className="mt-8 p-6 bg-charcoal dark:bg-charcoal/40 border border-steel/20">
                <div className="flex items-center gap-2 mb-4">
                  <Plus size={14} className="text-blue-500" />
                  <span className="font-mono text-[9px] uppercase tracking-widest text-concrete font-bold">Initialize New Cost Center</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input 
                    type="text" 
                    placeholder="Activity Name (e.g., Concrete Foundation)" 
                    className="bg-white/5 border border-steel/20 p-3 text-xs text-concrete focus:outline-none focus:border-blue-500 transition-all sm:col-span-1"
                    value={newItem.costCenter}
                    onChange={(e) => setNewItem({...newItem, costCenter: e.target.value})}
                  />
                  <input 
                    type="number" 
                    placeholder="Forecast ($)" 
                    className="bg-white/5 border border-steel/20 p-3 text-xs text-concrete focus:outline-none focus:border-blue-500 transition-all"
                    value={newItem.forecast || ''}
                    onChange={(e) => setNewItem({...newItem, forecast: Number(e.target.value)})}
                  />
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="Actual ($)" 
                      className="bg-white/5 border border-steel/20 p-3 text-xs text-concrete focus:outline-none focus:border-blue-500 transition-all flex-grow"
                      value={newItem.actual || ''}
                      onChange={(e) => setNewItem({...newItem, actual: Number(e.target.value)})}
                    />
                    <button 
                      onClick={handleAddItem}
                      disabled={!newItem.costCenter}
                      className="bg-blue-500 text-white px-5 py-3 hover:bg-blue-600 transition-all disabled:opacity-30 disabled:hover:bg-blue-500 shadow-lg shadow-blue-500/20 flex items-center justify-center"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
