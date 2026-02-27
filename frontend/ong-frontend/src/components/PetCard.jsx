import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const normalizeImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `http://localhost:3000${url}`;
  return `http://localhost:3000/${url}`;
};

const PetCard = ({ dog, variant = 'default' }) => {
  const isLarge = variant === 'large';
  const [imgError, setImgError] = React.useState(false);
  
  return (
    <Card 
      className={`group border-0 bg-white shadow-soft rounded-[2.5rem] overflow-hidden transition-all duration-700 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-3 hover:rotate-1`}
    >
      <CardContent className="p-0">
        <div className={`relative ${isLarge ? 'h-80' : 'h-72'} overflow-hidden bg-muted/30`}>
          {(!imgError && (normalizeImageUrl(dog.images?.[0]))) ? (
            <img
              src={normalizeImageUrl(dog.images?.[0])}
              alt={dog.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110 group-hover:rotate-1"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
              <span className="text-6xl mb-3 opacity-60">🐾</span>
              <p className="text-xs font-black uppercase tracking-widest text-foreground/40">Foto em breve</p>
            </div>
          )}
          
          {/* Top Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Sticker Badges - Top Left */}
          <div className="absolute top-5 left-5 flex flex-col gap-2">
             <span className="bg-white/95 backdrop-blur-md text-primary font-black text-[9px] px-3 py-1.5 rounded-lg shadow-lg uppercase tracking-widest -rotate-2 border-b-2 border-primary/10">
                {dog.size} 🐾
             </span>
          </div>
          
          {/* Sticker Badges - Top Right */}
          <div className="absolute top-5 right-5 flex flex-col gap-3 scale-90 origin-top-right">
            {dog.vaccinated && (
              <div className="bg-accent text-white font-black text-[9px] px-3 py-1.5 rounded-md shadow-xl uppercase tracking-widest flex items-center gap-2 transform rotate-3 border-r-2 border-accent/20">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Vacinado
              </div>
            )}
            {dog.neutered && (
              <div className="bg-secondary text-white font-black text-[9px] px-3 py-1.5 rounded-md shadow-xl uppercase tracking-widest flex items-center gap-2 transform -rotate-3 border-l-2 border-secondary/20">
                 <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                 Castrado
              </div>
            )}
          </div>

          {/* Emotional Caption - Only visible on hover */}
          {/* <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
            <p className="text-white text-xs font-black uppercase tracking-[0.2em] drop-shadow-lg">
              {dog.temperament ? 'Personalidade Única' : 'Esperando por você'}
            </p>
          </div> */}
        </div>
        
        <div className="p-8 relative bg-white">
          {/* The "Seal of Love" */}
          {/* <div className="absolute -top-12 right-10 bg-secondary p-5 rounded-[2rem] shadow-2xl transform rotate-12 transition-all duration-500 group-hover:rotate-0 group-hover:scale-110 group-hover:-translate-y-2 border-4 border-white">
            <Heart className="w-7 h-7 text-white fill-current animate-bounce-slow" />
          </div> */}
          
          <div className="mb-6">
            <h3 className={`heading-card italic text-left ${isLarge ? 'text-3xl' : 'text-2xl'} group-hover:text-primary transition-colors mb-2`}>
              {dog.name}
            </h3>
            <div className="flex items-center gap-2 text-foreground/40 font-black text-[10px] uppercase tracking-[0.2em]">
              <span>{dog.age}</span>
              <div className="w-1 h-1 rounded-full bg-primary/30" />
              <span>{dog.gender}</span>
              {dog.breed && (
                <>
                  <div className="w-1 h-1 rounded-full bg-primary/30" />
                  <span className="truncate max-w-[120px]">{dog.breed}</span>
                </>
              )}
            </div>
          </div>
          
          {/* <p className="text-foreground/60 text-sm font-medium mb-10 leading-relaxed line-clamp-2 italic border-l-2 border-primary/20 pl-4 py-1">
            "{dog.temperament || 'Este amiguinho tem um brilho especial nos olhos e muito amor para dar.'}"
          </p> */}
          
          <Button asChild className="btn-premium-lg h-12 rounded-full w-full bg-muted/40 text-primary border border-primary/10 hover:bg-primary hover:text-white shadow-none hover:shadow-xl hover:shadow-primary/20 transition-all duration-300">
            <Link to={`/adocao/${dog.id}`}>
               Conhecer História
               <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PetCard;
