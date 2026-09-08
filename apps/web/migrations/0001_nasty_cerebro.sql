CREATE TYPE "public"."fournisseur_paiement" AS ENUM('wave', 'orange_money', 'simule');--> statement-breakpoint
CREATE TYPE "public"."statut_livraison" AS ENUM('en_attente', 'envoyee', 'echouee');--> statement-breakpoint
CREATE TYPE "public"."statut_paiement" AS ENUM('en_attente', 'reussi', 'echoue', 'annule');--> statement-breakpoint
CREATE TABLE "livraisons" (
	"id" text PRIMARY KEY NOT NULL,
	"evenement_id" text NOT NULL,
	"canal" text NOT NULL,
	"destinataire" text NOT NULL,
	"statut" "statut_livraison" DEFAULT 'en_attente' NOT NULL,
	"erreur" text,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	"envoyee_le" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "paiements" (
	"id" text PRIMARY KEY NOT NULL,
	"evenement_id" text NOT NULL,
	"fournisseur" "fournisseur_paiement" NOT NULL,
	"reference" text NOT NULL,
	"montant" integer NOT NULL,
	"devise" text DEFAULT 'XOF' NOT NULL,
	"statut" "statut_paiement" DEFAULT 'en_attente' NOT NULL,
	"url_paiement" text,
	"charge" jsonb,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	"confirme_le" timestamp with time zone,
	CONSTRAINT "paiements_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
ALTER TABLE "evenements" ADD COLUMN "fichier_png" text;--> statement-breakpoint
ALTER TABLE "evenements" ADD COLUMN "fichier_pdf" text;--> statement-breakpoint
ALTER TABLE "livraisons" ADD CONSTRAINT "livraisons_evenement_id_evenements_id_fk" FOREIGN KEY ("evenement_id") REFERENCES "public"."evenements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_evenement_id_evenements_id_fk" FOREIGN KEY ("evenement_id") REFERENCES "public"."evenements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "livraisons_evenement" ON "livraisons" USING btree ("evenement_id");--> statement-breakpoint
CREATE INDEX "paiements_evenement" ON "paiements" USING btree ("evenement_id","statut");