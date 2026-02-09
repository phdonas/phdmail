import React from 'react';
import { PILLARS, getIcon } from '../constants';

const PillarGrid = () => {
  return (
    <section className="py-20 px-6 bg-[#f5f5f7]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PILLARS.map((pillar) => (
            <div 
              key={pillar.id}
              className="bg-white rounded-3xl p-10 card-shadow flex flex-col justify-between min-h-[400px]"
            >
              <div>
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8"
                  style={{ backgroundColor: pillar.accentColor + '15', color: pillar.accentColor }}
                >
                  {getIcon(pillar.icon)}
                </div>
                <h3 className="text-4xl font-bold mb-4">{pillar.title}</h3>
                <p className="text-lg text-gray-500 font-medium leading-relaxed">
                  {pillar.description}
                </p>
              </div>
              <div className="mt-8">
                <a 
                  href={`#/pilares#${pillar.id}`}
                  className="inline-flex items-center text-lg font-semibold text-blue-600 hover:underline"
                >
                  Saiba mais <span className="ml-1 text-2xl">›</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PillarGrid;