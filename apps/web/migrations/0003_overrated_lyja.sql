CREATE TYPE "public"."statut_moderation" AS ENUM('en_attente', 'publie', 'masque');--> statement-breakpoint
CREATE TABLE "messages_livre_or" (
	"id" text PRIMARY KEY NOT NULL,
	"evenement_id" text NOT NULL,
	"auteur" text NOT NULL,
	"message" text NOT NULL,
	"statut" "statut_moderation" DEFAULT 'publie' NOT NULL,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participations" (
	"id" text PRIMARY KEY NOT NULL,
	"evenement_id" text NOT NULL,
	"contributeur" text NOT NULL,
	"telephone" text,
	"montant" integer NOT NULL,
	"message" text,
	"reference" text NOT NULL,
	"statut" "statut_paiement" DEFAULT 'en_attente' NOT NULL,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	"confirmee_le" timestamp with time zone,
	CONSTRAINT "participations_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" text PRIMARY KEY NOT NULL,
	"evenement_id" text NOT NULL,
	"deposant_nom" text,
	"url" text NOT NULL,
	"statut" "statut_moderation" DEFAULT 'publie' NOT NULL,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "evenements" ADD COLUMN "livre_or_ouvert" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "evenements" ADD COLUMN "galerie_ouverte" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "evenements" ADD COLUMN "cagnotte_ouverte" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "evenements" ADD COLUMN "cagnotte_mot" text;--> statement-breakpoint
ALTER TABLE "messages_livre_or" ADD CONSTRAINT "messages_livre_or_evenement_id_evenements_id_fk" FOREIGN KEY ("evenement_id") REFERENCES "public"."evenements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participations" ADD CONSTRAINT "participations_evenement_id_evenements_id_fk" FOREIGN KEY ("evenement_id") REFERENCES "public"."evenements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_evenement_id_evenements_id_fk" FOREIGN KEY ("evenement_id") REFERENCES "public"."evenements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "livre_or_evenement" ON "messages_livre_or" USING btree ("evenement_id","statut");--> statement-breakpoint
CREATE INDEX "participations_evenement" ON "participations" USING btree ("evenement_id","statut");--> statement-breakpoint
CREATE INDEX "photos_evenement" ON "photos" USING btree ("evenement_id","statut");