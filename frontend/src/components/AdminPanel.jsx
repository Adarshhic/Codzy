import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router';
import { 
  Plus, Trash2, Code2, CheckCircle2, ArrowLeft, 
  Sparkles, FileText, Layers, ShieldCheck, Eye, EyeOff
} from 'lucide-react';
import Navbar from './Navbar';
import toast from 'react-hot-toast';

const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['array', 'linkedList', 'graph', 'dp']),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required')
    })
  ).min(1, 'At least one visible test case required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case required'),
  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).length(3, 'All three languages required'),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).length(3, 'All three languages required')
});

function AdminPanel() {
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      difficulty: 'medium',
      tags: 'array',
      visibleTestCases: [
        { input: '', output: '', explanation: '' }
      ],
      hiddenTestCases: [
        { input: '', output: '' }
      ],
      startCode: [
        { language: 'C++', initialCode: '#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    // Solution code\n};' },
        { language: 'Java', initialCode: 'class Solution {\n    // Solution code\n}' },
        { language: 'JavaScript', initialCode: 'function solution() {\n  // Solution code\n}' }
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '' },
        { language: 'Java', completeCode: '' },
        { language: 'JavaScript', completeCode: '' }
      ]
    }
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible
  } = useFieldArray({
    control,
    name: 'visibleTestCases'
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden
  } = useFieldArray({
    control,
    name: 'hiddenTestCases'
  });

  const onSubmit = async (data) => {
    try {
      await axiosClient.post('/problem/create', data);
      toast.success('Problem created successfully!');
      navigate('/admin');
    } catch (error) {
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col antialiased">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-zinc-400">
          <button 
            onClick={() => navigate('/admin')}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Admin Center</span>
          </button>
          <span>/</span>
          <span className="text-zinc-200 font-medium">Create Problem</span>
        </div>

        {/* Header Hero */}
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-white/[0.08] backdrop-blur-xl mb-8 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Plus size={20} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Create New Problem</h1>
          </div>
          <p className="text-zinc-400 text-sm">
            Fill in the problem specification, test cases, and starter templates.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Card 1: Problem Overview */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-6">
            <div className="flex items-center gap-2 text-base font-bold text-white border-b border-zinc-800 pb-4">
              <FileText size={18} className="text-indigo-400" />
              <span>General Information</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Problem Title *
              </label>
              <input
                {...register('title')}
                placeholder="e.g. Two Sum, Valid Anagram"
                className={`w-full px-4 py-3 bg-zinc-950 border ${errors.title ? 'border-rose-500' : 'border-zinc-800'} rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition-all`}
              />
              {errors.title && <span className="text-xs text-rose-400 mt-1 block">{errors.title.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Description (Markdown supported) *
              </label>
              <textarea
                {...register('description')}
                rows={6}
                placeholder="Describe the problem, input format, constraints, and requirements..."
                className={`w-full px-4 py-3 bg-zinc-950 border ${errors.description ? 'border-rose-500' : 'border-zinc-800'} rounded-xl text-white text-sm font-sans focus:outline-none focus:border-indigo-500 transition-all`}
              />
              {errors.description && <span className="text-xs text-rose-400 mt-1 block">{errors.description.message}</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Difficulty Level
                </label>
                <select
                  {...register('difficulty')}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Topic Category
                </label>
                <select
                  {...register('tags')}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="array">Array</option>
                  <option value="linkedList">Linked List</option>
                  <option value="graph">Graph</option>
                  <option value="dp">Dynamic Programming</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Test Cases */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2 text-base font-bold text-white">
                <Eye size={18} className="text-emerald-400" />
                <span>Visible Example Test Cases</span>
              </div>
              <button
                type="button"
                onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <Plus size={14} /> Add Visible Case
              </button>
            </div>

            <div className="space-y-4">
              {visibleFields.map((field, index) => (
                <div key={field.id} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400">Example Case #{index + 1}</span>
                    {visibleFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVisible(index)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      {...register(`visibleTestCases.${index}.input`)}
                      placeholder="Input (e.g. [2,7,11,15], 9)"
                      className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      {...register(`visibleTestCases.${index}.output`)}
                      placeholder="Expected Output (e.g. [0,1])"
                      className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <input
                    {...register(`visibleTestCases.${index}.explanation`)}
                    placeholder="Explanation (e.g. Because nums[0] + nums[1] == 9, we return [0, 1].)"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              ))}
            </div>

            {/* Hidden Cases */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-base font-bold text-white">
                <EyeOff size={18} className="text-amber-400" />
                <span>Hidden Evaluation Test Cases</span>
              </div>
              <button
                type="button"
                onClick={() => appendHidden({ input: '', output: '' })}
                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <Plus size={14} /> Add Hidden Case
              </button>
            </div>

            <div className="space-y-4">
              {hiddenFields.map((field, index) => (
                <div key={field.id} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400">Hidden Evaluation #{index + 1}</span>
                    {hiddenFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeHidden(index)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      {...register(`hiddenTestCases.${index}.input`)}
                      placeholder="Input"
                      className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      {...register(`hiddenTestCases.${index}.output`)}
                      placeholder="Output"
                      className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Code Templates & Reference */}
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-6">
            <div className="flex items-center gap-2 text-base font-bold text-white border-b border-zinc-800 pb-4">
              <Code2 size={18} className="text-indigo-400" />
              <span>Starter Code & Reference Solutions</span>
            </div>

            <div className="space-y-6">
              {[0, 1, 2].map((index) => {
                const langName = index === 0 ? 'C++' : index === 1 ? 'Java' : 'JavaScript';
                return (
                  <div key={index} className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{langName} Template</span>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">
                          Starter Code (Shown in student editor)
                        </label>
                        <textarea
                          {...register(`startCode.${index}.initialCode`)}
                          rows={6}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">
                          Reference Solution (For Judge Verification)
                        </label>
                        <textarea
                          {...register(`referenceSolution.${index}.completeCode`)}
                          rows={6}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Action Bar */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="px-6 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Challenge'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default AdminPanel;