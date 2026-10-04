// PAUSE — schermata finale della lettura (ridisegnata sul mockup):
// una grande card "Da ricordare" in vetro, centrata, con icona, titolo,
// la frase da ricordare in grande e l'indicatore "Storia completata".
// Sotto la card: Mi piace / Salva / Condividi (minimal, senza seconda card).
// Infine "Continua con" + la card della storia consigliata (copertina a
// sinistra, le tre icone del badge senza testo, titolo e freccia) e il
// pulsante "Scopri". Tutti i colori seguono il tema scelto dall'utente
// (colors.brand): il blu del mockup è solo un esempio.
import { Fragment } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import Ionicons from "@react-native-vector-icons/ionicons";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { Extrapolation, interpolate, useAnimatedStyle, SharedValue } from "react-native-reanimated";
import * as Haptics from "@/src/haptics";
import { play as playSound } from "@/src/sounds";

import { Story, StoryPreview, isLesson } from "@/src/api";
import { makeStyles, useTheme, spacing, radius, typography, withAlpha } from "@/src/theme";
import { useI18n } from "@/src/i18n";
import { READER_MAX_W } from "@/src/components/reader-section";
import { StoryHero } from "@/src/components/story-hero";
import { HighlightedTitle } from "@/src/components/highlighted-title";
import { ActionIcon3D } from "@/src/components/action-icon-3d";
import { KindIcon } from "@/src/components/kind-icon";
import { CategoryArtMark } from "@/src/components/category-artwork";

const CLOCK = require("../../assets/images/kind-clock.png");

type Props = {
  story: Story;
  liked: boolean;
  onLike: () => void;
  bookmarked: boolean;
  onBookmark: () => void;
  onShare: () => void;
  onNext: () => void;
  /** Prossima storia già precaricata: alimenta la card "Continua con". */
  next?: StoryPreview | null;
  bottomInset: number;
  /** Notifica un salvataggio/rimozione: il deep-dive mostra un banner ampio. */
  onSaved?: (saved: boolean) => void;
  /** Posizione di scroll, altezza pagina e Y del finale: per la dissolvenza
      morbida del contenuto quando si arriva in fondo alla storia. */
  scrollY?: SharedValue<number>;
  pageH?: SharedValue<number>;
  endTop?: SharedValue<number>;
};

// Le tre icone del badge della storia (Tipo · Categoria · Durata), stesso
// ordine e gerarchia delle card dell'app, ma senza testo e separate da sottili
// linee verticali. Riusa le icone già presenti (KindIcon, CategoryArtMark, orologio).
function BadgeIcons({ story, testID }: { story: StoryPreview; testID?: string }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const lesson = isLesson(story);
  const items = [
    <KindIcon key="kind" kind={lesson ? "lessons" : "stories"} size={26} glow={false} testID={`${testID}-kind`} />,
    <CategoryArtMark key="category" categoryId={story.category_id} color={story.category_color} size={20} aspect={1.3} plain tight testID={`${testID}-category`} />,
    <Image key="time" source={CLOCK} style={styles.badgeClock} contentFit="contain" transition={0} testID={`${testID}-time`} />,
  ];
  return (
    <View style={styles.badgeRow} testID={testID}>
      {items.map((icon, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <LinearGradient
              pointerEvents="none"
              colors={[withAlpha(colors.brand, 0), withAlpha(colors.brand, 0.4), withAlpha(colors.brand, 0)]}
              style={styles.badgeDivider}
            />
          )}
          <View style={styles.badgeIconWrap}>{icon}</View>
        </Fragment>
      ))}
    </View>
  );
}

export function ReaderEnding({ story, liked, onLike, bookmarked, onBookmark, onShare, onNext, next, bottomInset, onSaved, scrollY, pageH, endTop }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useI18n();

  const handleBookmark = () => {
    const willSave = !bookmarked;
    Haptics.notificationAsync(
      willSave ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning,
    ).catch(() => {});
    if (willSave) playSound("favorite");
    onBookmark();
    onSaved?.(willSave);
  };

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onLike();
  };
  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onShare();
  };

  // Dissolvenza morbida: il contenuto sale e compare appena prima di arrivare
  // in fondo (stessa logica dello sfondo finale).
  const reveal = useAnimatedStyle(() => {
    if (!scrollY || !pageH || !endTop) return { opacity: 1 };
    const end = endTop.value;
    if (end <= 0) return { opacity: 1 };
    const from = end - pageH.value * 0.5;
    const to = end - pageH.value * 0.12;
    const p = interpolate(scrollY.value, [from, to], [0, 1], Extrapolation.CLAMP);
    return { opacity: p, transform: [{ translateY: interpolate(p, [0, 1], [26, 0]) }] };
  });

  return (
    <Animated.View style={[styles.section, reveal, { paddingBottom: bottomInset + spacing.md }]} testID="deep-dive-ending">
      {/* Da ricordare — grande card in vetro, contenuto centrato. */}
      <View
        style={[styles.rememberCard, { borderColor: withAlpha(colors.brand, 0.34), boxShadow: `inset 0px 0px 30px ${withAlpha(colors.brand, 0.08)}, 0px 12px 34px ${colors.glassShadow}` as any }]}
        testID="remember-card"
      >
        <LinearGradient pointerEvents="none" colors={[withAlpha(colors.brand, 0.12), withAlpha(colors.surfaceDeep, 0.5)]} style={StyleSheet.absoluteFill} />
        <MaterialDesignIcons name="brain" size={30} color={colors.brand} style={styles.rememberIcon} />
        <Text style={[styles.rememberEyebrow, { color: colors.brand }]}>{t.remember}</Text>
        <LinearGradient
          pointerEvents="none"
          colors={[withAlpha(colors.brand, 0), withAlpha(colors.brand, 0.5), withAlpha(colors.brand, 0)]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.rememberRule}
        />
        <Text style={styles.summary} testID="summary-card" numberOfLines={8}>{story.summary}</Text>
        <LinearGradient
          pointerEvents="none"
          colors={[withAlpha(colors.brand, 0), withAlpha(colors.brand, 0.5), withAlpha(colors.brand, 0)]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.rememberRuleSm}
        />
        <View style={styles.completedRow} testID="story-completed">
          <Ionicons name="checkmark-circle" size={19} color={colors.brand} />
          <Text style={[styles.completedText, { color: colors.brand }]}>{t.story_completed}</Text>
        </View>
      </View>

      {/* Mi piace / Salva / Condividi — riga minimale, senza una seconda card. */}
      <View style={styles.actionBar} testID="deep-dive-actions">
        <ActionIcon3D kind="heart" active={liked} glowColor={colors.error} onPress={handleLike} testID="like-button" accessibilityLabel={t.i_like} />
        <LinearGradient pointerEvents="none" colors={[withAlpha(colors.intro, 0), withAlpha(colors.intro, 0.24), withAlpha(colors.intro, 0)]} style={styles.actionDivider} />
        <ActionIcon3D kind="bookmark" active={bookmarked} glowColor={colors.brand} onPress={handleBookmark} testID="bookmark-button" accessibilityLabel={t.save_verb} />
        <LinearGradient pointerEvents="none" colors={[withAlpha(colors.intro, 0), withAlpha(colors.intro, 0.24), withAlpha(colors.intro, 0)]} style={styles.actionDivider} />
        <ActionIcon3D kind="share" glowColor={colors.brand} onPress={handleShare} testID="share-story" accessibilityLabel={t.share} />
      </View>

      {/* Continua con — card della storia consigliata: copertina a sinistra,
          le tre icone del badge (senza testo), titolo e freccia a destra. */}
      {next ? (
        <View style={styles.nextWrap} testID="next-discovery">
          <Text style={styles.continueLabel} testID="next-discovery-title">{t.continue_with}</Text>
          <Pressable
            onPress={onNext}
            testID="next-story"
            accessibilityRole="button"
            accessibilityLabel={`${t.continue_with}: ${next.title}`}
            style={({ pressed }) => [styles.nextCard, { borderColor: withAlpha(colors.brand, 0.4) }, pressed && styles.pressed]}
          >
            <View style={styles.nextThumb}>
              <StoryHero story={next} style={StyleSheet.absoluteFill} size="thumb" iconSize={30} transition={0} />
            </View>
            <View style={styles.nextBody}>
              <BadgeIcons story={next} testID="next-badge-icons" />
              <HighlightedTitle title={next.title} highlight={next.highlight_words} style={styles.nextTitle} numberOfLines={2} />
            </View>
            <Ionicons name="arrow-forward" size={22} color={colors.textWarm} style={styles.nextArrow} />
          </Pressable>
        </View>
      ) : null}

      {/* Scopri — pulsante a pillola con bordo luminoso nel colore del tema. */}
      <Pressable
        onPress={onNext}
        testID="ending-read-btn"
        accessibilityRole="button"
        accessibilityLabel={t.discover_cta}
        style={({ pressed }) => [
          styles.discoverBtn,
          { borderColor: withAlpha(colors.brand, 0.75), backgroundColor: withAlpha(colors.surfaceDeep, 0.5), boxShadow: `0px 8px 26px ${withAlpha(colors.brand, 0.28)}` as any },
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.discoverText}>{t.discover_cta}</Text>
        <Ionicons name="arrow-forward" size={18} color={colors.textWarm} />
      </Pressable>
    </Animated.View>
  );
}

const useStyles = makeStyles((colors) => ({
  section: {
    width: "100%", maxWidth: READER_MAX_W, alignSelf: "center",
    paddingHorizontal: spacing.xl, paddingTop: spacing.sm, gap: spacing.md, flexGrow: 1,
  },

  // Card "Da ricordare": grande, in vetro, contenuto centrato.
  rememberCard: {
    borderRadius: radius.lg, borderWidth: 1, overflow: "hidden",
    alignItems: "center", alignSelf: "stretch",
    paddingVertical: spacing.lg, paddingHorizontal: spacing.lg, gap: spacing.sm,
    backgroundColor: withAlpha(colors.surfaceDeep, 0.46),
  },
  rememberIcon: { marginBottom: 2 },
  rememberEyebrow: { fontFamily: typography.bodyBold, fontSize: 12.5, letterSpacing: 2.6, textTransform: "uppercase" },
  rememberRule: { width: 120, height: 1, borderRadius: 1, marginTop: spacing.xs, marginBottom: spacing.sm },
  rememberRuleSm: { width: 72, height: 1, borderRadius: 1, marginTop: spacing.sm, marginBottom: spacing.xs },
  summary: {
    color: colors.textWarm, fontFamily: typography.display, fontSize: 22, lineHeight: 30, letterSpacing: -0.2, textAlign: "center",
    textShadowColor: withAlpha(colors.surface, 0.6), textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 8,
  },
  completedRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  completedText: { fontFamily: typography.bodyBold, fontSize: 13.5, letterSpacing: 0.3 },

  // Mi piace / Salva / Condividi: riga centrata, nessun fondo.
  actionBar: { flexDirection: "row", alignItems: "center", justifyContent: "center", alignSelf: "center", gap: spacing.lg, minHeight: 50 },
  actionDivider: { width: 1, height: 26 },

  // Continua con + card consigliata orizzontale.
  nextWrap: { marginTop: spacing.xs, gap: spacing.sm, flexGrow: 1 },
  continueLabel: { color: colors.textWarm, fontFamily: typography.displayBold, fontSize: 18, letterSpacing: 0.2 },
  nextCard: {
    flexDirection: "row", alignItems: "center", gap: spacing.md,
    borderRadius: radius.lg, borderWidth: 1, overflow: "hidden",
    padding: spacing.sm + 2,
    backgroundColor: withAlpha(colors.surfaceDeep, 0.5),
    boxShadow: `0px 10px 28px ${colors.glassShadow}` as any,
  },
  nextThumb: { width: 76, height: 76, borderRadius: radius.md, overflow: "hidden", backgroundColor: colors.surfaceTertiary },
  nextBody: { flex: 1, minWidth: 0, gap: 7, justifyContent: "center" },
  nextTitle: { color: colors.textWarm, fontFamily: typography.displayBold, fontSize: 18, lineHeight: 22 },
  nextArrow: { marginHorizontal: 4 },
  pressed: { opacity: 0.9 },

  // Riga delle tre icone del badge (senza testo), con sottili linee verticali.
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  badgeIconWrap: { width: 26, height: 26, alignItems: "center", justifyContent: "center" },
  badgeDivider: { width: 1, height: 16 },
  badgeClock: { width: 22, height: 22 },

  // Scopri — pillola con bordo luminoso.
  discoverBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    alignSelf: "center", minWidth: 220, height: 54, paddingHorizontal: spacing.xl,
    borderRadius: radius.pill, borderWidth: 1, marginTop: spacing.sm,
  },
  discoverText: { color: colors.textWarm, fontFamily: typography.bodyBold, fontSize: 15.5, letterSpacing: 0.4 },
}));
