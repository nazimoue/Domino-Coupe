import fs from 'fs';
import path from 'path';
import React from 'react';
import TeamClient from './TeamClient';

export default function TeamPage() {
	// Lire les images du dossier public côté serveur
	const imagesDir = path.join(process.cwd(), 'public', 'images', 'joueurs vrai');
	let files: string[] = [];
	try {
		files = fs.readdirSync(imagesDir).filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f));
	} catch (err) {
		console.error('Impossible de lire le dossier des joueurs:', err);
	}

	// Séparer la photo de la team (si présente)
	const teamPhotoName = files.find((f) => /team|la team|equipe/i.test(f)) || files.find((f) => /la Team/i.test(f));
	const playerFiles = files.filter((f) => f !== teamPhotoName);

	return (
		<main className="min-h-screen w-full bg-[#041336] text-[#f8fafc] p-6 font-sans">
			<div className="max-w-5xl mx-auto">
				<h1 className="text-3xl font-bold text-[#fbbf24] mb-6">Les joueurs du tournoi</h1>

				{/* Composant client pour l'interaction */}
				<TeamClient playerFiles={playerFiles} teamPhotoName={teamPhotoName} />
			</div>
		</main>
	);
}

