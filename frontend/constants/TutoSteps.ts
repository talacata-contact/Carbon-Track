type HighlightPos = { x: number; y: number; width: number; height: number };

type TutoStep = {
  message?: string;
  highlightPos?: HighlightPos;
  dynamic?: (
    iterations?: any[],
    iterationsList?: any[],
    suggestionsVisible?: boolean
  ) => { message: string; highlightPos: HighlightPos };
};

export const tutoSteps: Record<string, TutoStep[]> = {
  general: [
    {
      message: "Bienvenue ! Faisons un rapide tour des fonctionnalités de la page Générale.",
      highlightPos: { x: 0, y: 0, width: 0, height: 0 },
    },
    {
      message: "Ajoutez un événement ici !\nPour un logement, un transport ou un aliment.",
      highlightPos: { x: 332, y: 649, width: 70, height: 70 },
    },
    {
      message:
        "Ici sera affiché votre graphe CO2 par catégorie.\nCela inclut vos actions pour une période choisie.\nL'historique de vos émissions sera également visible.",
      highlightPos: { x: 10, y: 130, width: 390, height: 300 },
    },
    {
      message:
        "Sélectionnez la période ici.\nPar défaut, le mois en cours est sélectionné.",
      highlightPos: { x: 205, y: 75, width: 200, height: 55 },
    },
    {
      message:
        "Vous pouvez retrouver des aides spécifiques à la page sur laquelle vous vous trouvez\nen cliquant sur l'icône d'aide.",
      highlightPos: { x: 0, y: 0, width: 0, height: 0 },
    },
    {
      message:
        "Vous pouvez dès à présent compléter vos objectifs dans les paramètres puis ajouter vos premiers événements !",
      highlightPos: { x: 0, y: 0, width: 0, height: 0 },
    },
  ],

  aliment: [
    {
      message: "Bienvenue sur la page spécifique aux émissions liées à l'alimentation !",
      highlightPos: { x: 0, y: 0, width: 0, height: 0 },
    },
    {
      message:
        "Vous avez la possibilité d'ajouter un évènement \n- En scannant un code-barres,\n- En recherchant par mots-clés dans la base de données.",
      highlightPos: { x: 335, y: 590, width: 65, height: 130 },
    },
    // Graphe
    {
      dynamic: (iterations?: any[], _iterationsList?: any[], _suggestionsVisible?: boolean) => ({
        message:
          iterations && iterations.length > 0
            ? "Ce graphe vous permet de faire un point sur votre consommation pour la période sélectionnée."
            : "Une fois vos données ajoutées, elles apparaîtront dans un graphe. \nVous pourrez retrouver des informations comme la moyenne française et votre objectif (à définir dans les paramètres).",
        highlightPos:
          iterations && iterations.length > 0
            ? { x: 10, y: 110, width: 390, height: 270 }
            : { x: 20, y: 105, width: 365, height: 30 },
      }),
    },
    {
      message:
        "Vous pouvez filtrer pour la période souhaitée ici pour : \n- Ce mois\n- Cette semaine.",
      highlightPos: { x: 205, y: 68, width: 190, height: 40 },
    },
    // Historique
    {
      dynamic: (iterations?: any[], _iterationsList?: any[], suggestionsVisible?: boolean) => {
        if (iterations && iterations.length > 0 && suggestionsVisible) {
          return {
            message: "Vous retrouvez ici votre historique complet avec filtrage actif.",
            highlightPos: { x: 20, y: 500, width: 370, height: 360 },
          };
        } else if (iterations && iterations.length > 0) {
          return {
            message:
              "Vous retrouvez ici votre historique complet avec filtrage actif.",
            highlightPos: { x: 10, y: 380, width: 390, height: 370 },
          };
        } else {
          return {
            message:
              "Tous les évènements seront listés ici.\nLes évènements au-delà de l'objectif seront indiqués en rouge.",
            highlightPos: { x: 20, y: 210, width: 365, height: 30 },
          };
        }
      },
    },
    // Filtre objectif
    {
      dynamic: (iterations?: any[], _iterationsList?: any[], suggestionsVisible?: boolean) => {
        if (iterations && iterations.length > 0 && suggestionsVisible) {
          return {
            message:
              "Vous pouvez filtrer vos événements par rapport à votre objectif et comparer ceux au-dessus ou en-dessous.",
            highlightPos: { x: 205, y: 505, width: 190, height: 40 },
          };
        } else if (iterations && iterations.length > 0) {
          return {
            message:
              "Vous pouvez filtrer vos événements par rapport à votre objectif et comparer ceux au-dessus ou en-dessous.",
            highlightPos: { x: 205, y: 385, width: 190, height: 40 },
          };
        } else {
          return {
            message:
              "Vous pouvez filtrer pour n'afficher que les événements au-dessus ou en-dessous de votre objectif.",
            highlightPos: { x: 205, y: 152, width: 190, height: 40 },
          };
        }
      },
    },
    // Suggestions
    {
      dynamic: (_?: any[], _iterationsList?: any[], suggestionsVisible?: boolean) => ({
        message: suggestionsVisible
          ? "Voici des suggestions pour réduire vos émissions en fonction des évènements réalisés."
          : "Suivant vos événements, des suggestions pour réduire vos émissions apparaîtront.",
        highlightPos: suggestionsVisible
          ? { x: 10, y: 380, width: 390, height: 120 }
          : { x: 0, y: 0, width: 0, height: 0 },
      }),
    },
  ],


  transport: [
    {
      message: "Bienvenue sur la page spécifique aux émissions liées aux transports !",
      highlightPos: { x: 0, y: 0, width: 0, height: 0 },
    },
    {
      message:
        "Vous pouvez ajouter un évènement : \n- Création d'un transport et son ajout aux favoris \n- Utilisation d'un transport",
      highlightPos: { x: 335, y: 650, width: 65, height: 70 },
    },
    // Graphe
    {
      dynamic: (iterations?: any[]) => ({
        message:
          iterations && iterations.length > 0
            ? "Ce graphe vous permet de faire un point sur votre consommation pour la période sélectionnée."
            : "Une fois vos données ajoutées, elles apparaîtront dans un graphe. \nPour les transports vous ne retrouverez pas leur création dans le graphe.  \nVous pourrez retrouver des informations comme la moyenne française et votre objectif (à définir dans les paramètres).",
        highlightPos:
          iterations && iterations.length > 0
            ? { x: 10, y: 110, width: 390, height: 270 }
            : { x: 20, y: 105, width: 365, height: 30 },
      }),
    },
    {
      message:
        "Vous pouvez filtrer pour la période souhaitée ici pour : \n- Ce mois\n- Cette semaine.",
      highlightPos: { x: 205, y: 68, width: 190, height: 40 },
    },
    // Historique
    {
      dynamic: (iterations?: any[], iterationsList?: any[], suggestionsVisible?: boolean) => {
        if (iterations && iterations.length == 0 && iterationsList && iterationsList.length > 0 && suggestionsVisible) {
          return {
            message: "Vous retrouvez ici votre historique complet avec filtrage actif.",
            highlightPos: { x: 20, y: 270, width: 370, height: 330 },
          };
        } else if (iterations && iterations.length == 0 && iterationsList && iterationsList.length > 0) {
          return {
            message: "Vous retrouvez ici votre historique complet avec filtrage actif.",
            highlightPos: { x: 10, y: 140, width: 390, height: 370 },
          };
        } else if (iterations && iterations.length > 0 && suggestionsVisible) {
          return {
            message: "Vous retrouvez ici votre historique complet avec filtrage actif.",
            highlightPos: { x: 20, y: 500, width: 370, height: 360 },
          };
        } else if (iterations && iterations.length > 0) {
          return {
            message: "Vous retrouvez ici votre historique complet avec filtrage actif.",
            highlightPos: { x: 10, y: 380, width: 390, height: 370 },
          };
        } else {
          return {
            message:
              "Tous les évènements seront listés ici.\nLes évènements au-delà de l'objectif seront indiqués en rouge.",
            highlightPos: { x: 20, y: 210, width: 365, height: 30 },
          };
        }
      },
    },
    // Filtre objectif
    {
      dynamic: (iterations?: any[], iterationsList?: any[], suggestionsVisible?: boolean) => {
        if (iterations && iterations.length == 0 && iterationsList && iterationsList.length > 0 && suggestionsVisible) {
          return {
            message:
              "Vous pouvez filtrer vos événements par rapport à votre objectif et comparer ceux au-dessus ou en-dessous.",
            highlightPos: { x: 205, y: 272, width: 190, height: 40 },
          };
        } else if (iterations && iterations.length == 0 && iterationsList && iterationsList.length > 0) {
          return {
            message:
              "Vous pouvez filtrer vos événements par rapport à votre objectif et comparer ceux au-dessus ou en-dessous.",
            highlightPos: { x: 205, y: 152, width: 190, height: 40 },
          };
        } else if (iterations && iterations.length > 0 && suggestionsVisible) {
          return {
            message:
              "Vous pouvez filtrer vos événements par rapport à votre objectif et comparer ceux au-dessus ou en-dessous.",
            highlightPos: { x: 205, y: 505, width: 190, height: 40 },
          };
        } else if (iterations && iterations.length > 0) {
          return {
            message:
              "Vous pouvez filtrer vos événements par rapport à votre objectif et comparer ceux au-dessus ou en-dessous.",
            highlightPos: { x: 205, y: 385, width: 190, height: 40 },
          };
        } else {
          return {
            message:
              "Vous pouvez filtrer pour n'afficher que les événements au-dessus ou en-dessous de votre objectif.",
            highlightPos: { x: 205, y: 152, width: 190, height: 40 },
          };
        }
      },
    },
    // Suggestions
    {
      dynamic: (_?: any[], _iterationsList?: any[], suggestionsVisible?: boolean) => ({
        message: suggestionsVisible
          ? "Voici des suggestions pour réduire vos émissions en fonction des évènements réalisés."
          : "Suivant vos événements, des suggestions pour réduire vos émissions apparaîtront.",
        highlightPos: suggestionsVisible
          ? { x: 10, y: 380, width: 390, height: 120 }
          : { x: 0, y: 0, width: 0, height: 0 },
      }),
    },
  ],

  logement: [
    {
      message: "Bienvenue sur la page spécifique aux émissions liées au logement !",
      highlightPos: { x: 0, y: 0, width: 0, height: 0 },
    },
    {
      message:
        "Vous pouvez ajouter un évènement : \n- Ajout d'un logement aux favoris et son utilisation passive \n- Utilisation d'un logement",
        highlightPos: { x: 335, y: 650, width: 65, height: 70 },
    },
    // Graphe
    {
      dynamic: (iterations?: any[], _iterationsList?: any[], _suggestionsVisible?: boolean) => ({
        message:
          iterations && iterations.length > 0
            ? "Ce graphe vous permet de faire un point sur votre consommation pour la période sélectionnée."
            : "Une fois vos données ajoutées, elles apparaîtront dans un graphe. \nVous pourrez retrouver des informations comme la moyenne française et votre objectif (à définir dans les paramètres).",
        highlightPos:
          iterations && iterations.length > 0
            ? { x: 10, y: 110, width: 390, height: 270 }
            : { x: 20, y: 105, width: 365, height: 30 },
      }),
    },
    {
      message:
        "Vous pouvez filtrer pour la période souhaitée ici pour : \n- Ce mois\n- Cette semaine.",
      highlightPos: { x: 205, y: 68, width: 190, height: 40 },
    },
    // Historique
    {
      dynamic: (iterations?: any[], _iterationsList?: any[], suggestionsVisible?: boolean) => {
        if (iterations && iterations.length > 0 && suggestionsVisible) {
          return {
            message: "Vous retrouvez ici votre historique complet avec filtrage actif.",
            highlightPos: { x: 20, y: 500, width: 370, height: 360 },
          };
        } else if (iterations && iterations.length > 0) {
          return {
            message:
              "Vous retrouvez ici votre historique complet avec filtrage actif.",
            highlightPos: { x: 10, y: 380, width: 390, height: 370 },
          };
        } else {
          return {
            message:
              "Tous les évènements seront listés ici.\nLes évènements au-delà de l'objectif seront indiqués en rouge.",
            highlightPos: { x: 20, y: 210, width: 365, height: 30 },
          };
        }
      },
    },
    // Filtre objectif
    {
      dynamic: (iterations?: any[], _iterationsList?: any[], suggestionsVisible?: boolean) => {
        if (iterations && iterations.length > 0 && suggestionsVisible) {
          return {
            message:
              "Vous pouvez filtrer vos événements par rapport à votre objectif et comparer ceux au-dessus ou en-dessous.",
            highlightPos: { x: 205, y: 505, width: 190, height: 40 },
          };
        } else if (iterations && iterations.length > 0) {
          return {
            message:
              "Vous pouvez filtrer vos événements par rapport à votre objectif et comparer ceux au-dessus ou en-dessous.",
            highlightPos: { x: 205, y: 385, width: 190, height: 40 },
          };
        } else {
          return {
            message:
              "Vous pouvez filtrer pour n'afficher que les événements au-dessus ou en-dessous de votre objectif.",
            highlightPos: { x: 205, y: 152, width: 190, height: 40 },
          };
        }
      },
    },
    // Suggestions
    {
      dynamic: (_?: any[], _iterationsList?: any[], suggestionsVisible?: boolean) => ({
        message: suggestionsVisible
          ? "Voici des suggestions pour réduire vos émissions en fonction des évènements réalisés."
          : "Suivant vos événements, des suggestions pour réduire vos émissions apparaîtront.",
        highlightPos: suggestionsVisible
          ? { x: 10, y: 380, width: 390, height: 120 }
          : { x: 0, y: 0, width: 0, height: 0 },
      }),
    },
  ],

  categoryA: [
    {
      message: "Bienvenue sur la page spécifique à un évènement !",
      highlightPos: { x: 0, y: 0, width: 0, height: 0 },
    },
    {
      message: "Vous retrouvez ici le détail de la reférence.",
      highlightPos: { x: 10, y: 10, width: 390, height: 125 },
    },
    {
      message: "Vous trouvez ici la consomation totale de cette référence.",
      highlightPos: { x: 10, y: 125, width: 390, height: 30 },
    },
    {
      message: "Un équivalent peut être affiché pour mieux visualiser l'impact de cette référence.",
      highlightPos: { x: 10, y: 160, width: 390, height: 90 },
    },
    {
      message: "La liste de toutes les itérations liées à cette référence est affichée ici. \nVous pouvez les modifier ou les supprimer en cliquant dessus.",
      highlightPos: { x: 10, y: 245, width: 390, height: 300 },
    },
  ],

  categoryT: [
    {
      message: "Bienvenue sur la page spécifique à un évènement !",
      highlightPos: { x: 0, y: 0, width: 0, height: 0 },
    },
    {
      message: "Vous retrouvez ici le détail de la reférence.",
      highlightPos: { x: 10, y: 10, width: 390, height: 110 },
    },
    {
      message: "Vous pouvez modifier la reférence.",
      highlightPos: { x: 360, y: 10, width: 40, height: 60 },
    },
    {
      message: "Vous trouvez ici la consomation totale de cette référence.",
      highlightPos: { x: 10, y: 115, width: 390, height: 30 },
    },
    {
      message: "Un équivalent peut être affiché pour mieux visualiser l'impact de cette référence.",
      highlightPos: { x: 10, y: 150, width: 390, height: 90 },
    },
    {
      message: "La liste de toutes les itérations liées à cette référence est affichée ici. \nVous pouvez les modifier ou les supprimer en cliquant dessus.",
      highlightPos: { x: 10, y: 240, width: 390, height: 300 },
    },
  ],

  categoryL: [
    {
      message: "Bienvenue sur la page spécifique à un évènement !",
      highlightPos: { x: 0, y: 0, width: 0, height: 0 },
    },
    {
      message: "Vous retrouvez ici le détail de la reférence.",
      highlightPos: { x: 10, y: 10, width: 390, height: 170 },
    },
    {
      message: "Vous pouvez modifier la reférence.",
      highlightPos: { x: 360, y: 10, width: 40, height: 60 },
    },
    {
      message: "Vous trouvez ici la consomation totale de cette référence.",
      highlightPos: { x: 10, y: 150, width: 390, height: 30 },
    },
    {
      message: "Un équivalent peut être affiché pour mieux visualiser l'impact de cette référence.",
      highlightPos: { x: 10, y: 180, width: 390, height: 90 },
    },
    {
      message: "La liste de toutes les itérations liées à cette référence est affichée ici. \nVous pouvez les modifier ou les supprimer en cliquant dessus.",
      highlightPos: { x: 10, y: 270, width: 390, height: 300 },
    },
  ],
};
