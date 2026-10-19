import { Fragment, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Factory,
  Leaf,
  MoveUpRight,
  Plus,
  Ruler,
  ShieldCheck,
} from "lucide-react";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { FaqItem } from "../ui/faq-item";
import { RevealSection } from "../ui/reveal-section";
import { Booking } from "./Booking";
import { CATALOG } from "../../data/catalog";
import { FACADES, money } from "../../data/materials";
import { KitchenSVG } from "../configurator/KitchenSVG";
import type { Project } from "../../domain/types";
export function Landing({
  project,
  onDesign,
  onCatalog,
  onConsult,
}: {
  project: Project;
  onDesign: () => void;
  onCatalog: (id: string) => void;
  onConsult: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const [filter, setFilter] = useState("Все кухни"),
    [gallery, setGallery] = useState<number | null>(null),
    [compare, setCompare] = useState(false),
    [matA, setMatA] = useState("enamel"),
    [matB, setMatB] = useState("veneer");
  const a = FACADES.find((m) => m.id === matA)!,
    b = FACADES.find((m) => m.id === matB)!;
  return (
    <main>
      <section className="hero" id="home">
        <div className="hero-photo">
          <img
            src="/images/hero.jpg"
            alt="Светлая кухня из натурального дуба с каменной столешницей"
            fetchPriority="high"
          />
        </div>
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1>
              Пространство
              <br />
              вашей <em>жизни.</em>
            </h1>
            <p>
              Создаём кухни, в которых хочется
              <br className="desktop-break" /> готовить, собираться и просто
              быть.
            </p>
            <Button onClick={onDesign}>
              Спроектировать кухню <ArrowUpRight size={18} />
            </Button>
            <a href="#collections" className="hero-secondary">
              Посмотреть коллекции <ArrowRight size={16} />
            </a>
          </motion.div>
        </div>
        <a
          className="scroll-cue"
          href="#philosophy"
          aria-label="Прокрутить к философии бренда"
        >
          <ArrowDown size={16} />
        </a>
      </section>
      <RevealSection className="brand-strip" id="philosophy">
        <h2>
          Красота — в том, <em>как вам живётся.</em>
        </h2>
      </RevealSection>
      <RevealSection className="intro-section section-wrap">
        <div className="intro-title">
          <h2>
            Не просто кухня.
            <br />
            <em>Ваше место силы.</em>
          </h2>
        </div>
        <div className="intro-copy">
          <p>
            Утренний кофе в тишине. Ужин, который собирает всех. Разговоры без
            повода. Мы проектируем не только мебель — мы думаем о жизни, которая
            будет вокруг неё.
          </p>
          <div className="benefit-row">
            {[
              [
                Factory,
                "Собственное производство",
                "От материала до готовой кухни",
              ],
              [Leaf, "Природные фактуры", "Материалы, приятные на ощупь"],
              [
                ShieldCheck,
                "Внимание к деталям",
                "Качество в каждом соединении",
              ],
            ].map(([Icon, title, text]) => {
              const I = Icon as typeof Factory;
              return (
                <div key={title as string}>
                  <I size={22} strokeWidth={1.25} />
                  <h3>{title as string}</h3>
                  <p>{text as string}</p>
                </div>
              );
            })}
          </div>
        </div>
      </RevealSection>
      <RevealSection id="collections" className="collections section-wrap">
        <div className="section-heading">
          <div>
            <h2>
              Созданы <em>быть вашими.</em>
            </h2>
          </div>
          <button
            className="text-link"
            onClick={() => {
              setFilter("Все кухни");
              document
                .getElementById("catalog-grid")
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          >
            Смотреть все <ArrowUpRight size={17} />
          </button>
        </div>
        <div className="catalog-filter" aria-label="Фильтры каталога">
          {["Все кухни", "Современная", "Минимализм"].map((f) => (
            <button
              key={f}
              className={filter === f ? "active" : ""}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="catalog-grid" id="catalog-grid">
          <AnimatePresence initial={false} mode="popLayout">
          {CATALOG.filter(
            (c) => filter === "Все кухни" || c.style === filter,
          ).map((c) => (
            <motion.article
              className="catalog-card"
              key={c.id}
              layout={reducedMotion ? false : "position"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                className="catalog-image"
                onClick={() =>
                  setGallery(CATALOG.findIndex((x) => x.id === c.id))
                }
                aria-label={`Открыть фото кухни ${c.name}`}
              >
                <img
                  src={c.image}
                  alt={`Кухня ${c.name}: ${c.subtitle}`}
                  loading="lazy"
                />
                <span className="image-zoom">
                  <Plus size={20} />
                </span>
              </button>
              <div className="catalog-info">
                <div>
                  <h3>
                    {c.name} <span>/ {c.material}</span>
                  </h3>
                  <p>{c.subtitle}</p>
                  <b>от {money(c.price)}</b>
                </div>
                <button
                  className="circle-button"
                  aria-label={`Спроектировать кухню ${c.name}`}
                  onClick={() => onCatalog(c.id)}
                >
                  <ArrowUpRight size={19} />
                </button>
              </div>
            </motion.article>
          ))}
          </AnimatePresence>
        </div>
      </RevealSection>
      <RevealSection className="design-section" id="designer">
        <div className="design-copy">
          <span className="eyebrow light">ОНЛАЙН-КОНСТРУКТОР</span>
          <h2>
            Хорошая кухня
            <br />
            начинается
            <br />
            <em>с вашей идеи.</em>
          </h2>
          <p>
            Выберите планировку, расставьте модули,
            <br />
            найдите свои материалы. Стоимость
            <br />
            рассчитается прямо на ваших глазах.
          </p>
          <div className="design-pills">
            <span>
              <Check size={13} /> Настоящая 2D-схема
            </span>
            <span>
              <Check size={13} /> Расчёт в реальном времени
            </span>
          </div>
          <Button className="btn-light" onClick={onDesign}>
            Создать свою кухню <ArrowUpRight size={17} />
          </Button>
          <span className="design-note">
            Бесплатно. Без регистрации. В вашем темпе.
          </span>
        </div>
        <div className="design-preview">
          <div className="preview-window">
            <div className="preview-window-top">
              <span className="window-dots">
                <i />
                <i />
                <i />
              </span>
              <span>ВАША КУХНЯ · FORMA</span>
              <Ruler size={13} />
            </div>
            <div className="preview-title">
              <h3>
                Место для <em>ваших идей</em>
              </h3>
              <span>Вид сверху</span>
            </div>
            <KitchenSVG project={project} />
            <div className="preview-window-bottom">
              <span>
                <span className="status-dot" /> Проект готов к изменениям
              </span>
              <button
                className="circle-button"
                aria-label="Открыть конструктор"
                onClick={onDesign}
              >
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </RevealSection>
      <RevealSection className="spaces-section section-wrap" id="projects">
        <div className="spaces-image">
          <button
            onClick={() => setGallery(3)}
            aria-label="Открыть интерьерную визуализацию"
          >
            <img
              src="/images/interior.jpg"
              alt="Тёплое жилое пространство с кухней и обеденной зоной"
              loading="lazy"
            />
            <span className="image-zoom">
              <Plus size={20} />
            </span>
          </button>
        </div>
        <div className="spaces-copy">
          <h2>
            Вписаться
            <br />в интерьер.
            <br />
            <em>Остаться в сердце.</em>
          </h2>
          <p>
            У каждого дома — свой ритм. Мы подбираем пропорции, оттенки и детали
            так, чтобы кухня стала его естественным продолжением.
          </p>
          <button className="text-link" onClick={() => setGallery(0)}>
            Смотреть проекты <ArrowUpRight size={17} />
          </button>
        </div>
      </RevealSection>
      <RevealSection className="materials-section section-wrap" id="materials">
        <div className="section-heading">
          <div>
            <h2>
              Материалы, которые <em>чувствуешь.</em>
            </h2>
          </div>
          <button className="text-link" onClick={() => setCompare(true)}>
            Сравнить материалы <MoveUpRight size={16} />
          </button>
        </div>
        <div className="materials-grid">
          {FACADES.map((m, i) => (
            <button
              className="material-card"
              key={m.id}
              onClick={() => {
                setMatA(m.id);
                setMatB(m.id === "veneer" ? "enamel" : "veneer");
                setCompare(true);
              }}
            >
              <div
                className={`material-swatch swatch-${i}`}
                style={{ backgroundColor: m.sample }}
              >
                <span>0{i + 1}</span>
                <ArrowUpRight size={17} />
              </div>
              <h3>{m.name}</h3>
              <p>{m.description}</p>
              <span>от {money(m.price)} / пог. м</span>
            </button>
          ))}
        </div>
      </RevealSection>
      <RevealSection className="process-section section-wrap" id="process">
        <div className="section-heading">
          <div>
            <h2>
              От «а что, если» — <em>до «как дома».</em>
            </h2>
          </div>
        </div>
        <div className="process-grid">
          {[
            [
              "01",
              "Ваша идея",
              "Начните в конструкторе или расскажите нам, о какой кухне мечтаете.",
            ],
            [
              "02",
              "Точный замер",
              "Уточняем размеры, коммуникации и особенности вашего пространства.",
            ],
            [
              "03",
              "Ваш проект",
              "Согласовываем материалы, расположение модулей и подробную смету.",
            ],
            [
              "04",
              "Воплощение",
              "Изготавливаем, доставляем и бережно собираем вашу новую кухню.",
            ],
          ].map(([n, title, desc]) => (
            <Fragment key={n}>
              <div className="process-step">
                <span>{n}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
              {n !== "04" && (
                <ArrowRight
                  className="process-arrow"
                  size={20}
                  strokeWidth={1.25}
                  aria-hidden="true"
                />
              )}
            </Fragment>
          ))}
        </div>
      </RevealSection>
      <RevealSection className="booking-section section-wrap" id="booking">
        <div className="booking-copy">
          <h2>
            Большие идеи.
            <br />
            <em>Точные размеры.</em>
          </h2>
          <p>
            Выберите удобное время для бесплатного замера. Это первый шаг к
            кухне, которая подойдёт именно вам.
          </p>
          <div className="booking-perks">
            <span>
              <Check size={15} /> Обсудим планировку и ваши привычки
            </span>
            <span>
              <Check size={15} /> Учтём каждый угол и коммуникации
            </span>
            <span>
              <Check size={15} /> Подберём материалы под ваш бюджет
            </span>
          </div>
        </div>
        <Booking project={project} />
      </RevealSection>
      <RevealSection className="faq-section section-wrap">
        <div>
          <h2>
            Остались <em>вопросы?</em>
          </h2>
          <p>
            Хорошая кухня начинается
            <br />с понятных ответов.
          </p>
          <button className="text-link" onClick={onConsult}>
            Обсудить вашу идею <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="faq-list">
          {[
            [
              "Насколько точен расчёт в конструкторе?",
              "Это предварительная оценка. Итог зависит от точных размеров, выбранных решений, монтажа и техники. Диапазон показан рядом со сметой.",
            ],
            [
              "Можно ли сохранить проект и вернуться позже?",
              "Да. Сохраните проект на своём устройстве или скопируйте ссылку. Ссылка содержит только настройки кухни и позволяет открыть её в другом браузере.",
            ],
            [
              "Как учитываются углы кухни?",
              "Конструктор резервирует место для угловых элементов, проверяет пересечения шкафов и учитывает каждый угол только один раз при расчёте.",
            ],
            [
              "Можно ли заказать кухню через этот сайт?",
              "Запишитесь на замер, чтобы обсудить проект, уточнить размеры и подобрать материалы для вашей кухни.",
            ],
            [
              "Что входит в предварительную стоимость?",
              "Корпуса, выбранные модули, фасады, столешница, угловые элементы, фурнитура и включённые вами опции. Техника, доставка и монтаж не включены.",
            ],
          ].map(([q, answer]) => (
            <FaqItem key={q} question={q} answer={answer} />
          ))}
        </div>
      </RevealSection>
      <RevealSection className="closing-cta">
        <span className="eyebrow">ВАШ ДОМ. ВАШ ХАРАКТЕР. ВАША FORMA.</span>
        <h2>
          Давайте создадим <em>вашу кухню.</em>
        </h2>
        <Button onClick={onDesign}>
          Начать проект <ArrowUpRight size={17} />
        </Button>
      </RevealSection>
      <footer id="contacts">
        <div className="footer-main">
          <div>
            <a className="logo footer-logo" href="#home">
              FORMA<span>MEBEL</span>
            </a>
            <p>
              Мебель для жизни.
              <br />
              Пространство для вас.
            </p>
          </div>
          <div>
            <span className="eyebrow">ВДОХНОВЕНИЕ</span>
            <a href="#collections">Коллекции кухонь</a>
            <a href="#projects">Интерьеры</a>
            <a href="#materials">Материалы</a>
          </div>
          <div>
            <span className="eyebrow">ВАША КУХНЯ</span>
            <button onClick={onDesign}>Онлайн-конструктор</button>
            <a href="#booking">Запись на замер</a>
            <a href="#process">Как мы работаем</a>
          </div>
          <div className="footer-contact">
            <span className="eyebrow">НАЧНЁМ С РАЗГОВОРА</span>
            <button onClick={onConsult}>
              Обсудить проект <ArrowUpRight size={18} />
            </button>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} FORMA MEBEL</span>
          <a href="#home">
            Наверх <ArrowUpRight size={13} />
          </a>
        </div>
      </footer>
      <Dialog
        open={gallery !== null}
        onOpenChange={(v) => {
          if (!v) setGallery(null);
        }}
        title="Интерьеры FORMA"
        description="Интерьеры, которые помогают представить кухню дома."
        wide
      >
        <div className="gallery">
          <img
            src={
              gallery === 3
                ? "/images/interior.jpg"
                : CATALOG[gallery ?? 0].image
            }
            alt={
              gallery === 3
                ? "Интерьер загородного дома"
                : `Кухня ${CATALOG[gallery ?? 0].name}`
            }
          />
          <div className="gallery-controls">
            <button
              className="circle-button"
              aria-label="Предыдущее фото"
              onClick={() => setGallery(((gallery ?? 0) + 3) % 4)}
            >
              <ChevronLeft size={20} />
            </button>
            <span>
              {(gallery ?? 0) + 1} / 4 ·{" "}
              {gallery === 3 ? "Тёплый дом" : CATALOG[gallery ?? 0].name}
            </span>
            <button
              className="circle-button"
              aria-label="Следующее фото"
              onClick={() => setGallery(((gallery ?? 0) + 1) % 4)}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </Dialog>
      <Dialog
        open={compare}
        onOpenChange={setCompare}
        title="Найдите свой материал"
        description="Сравните стоимость, фактуру и особенности ухода."
        wide
      >
        <div className="material-compare">
          {[
            [a, matA, setMatA],
            [b, matB, setMatB],
          ].map(([material, value, set], i) => {
            const m = material as typeof a;
            const setter = set as (v: string) => void;
            return (
              <div key={i}>
                <select
                  aria-label={`Материал ${i + 1}`}
                  value={value as string}
                  onChange={(ev) => setter(ev.target.value)}
                >
                  {FACADES.map((f) => (
                    <option value={f.id} key={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
                <div
                  className={`compare-swatch ${m.id === "veneer" || m.id === "wood" ? "wood-texture" : ""}`}
                  style={{ backgroundColor: m.sample }}
                />
                <h3>{m.name}</h3>
                <p>{m.description}</p>
                <dl>
                  <div>
                    <dt>Цена фасадов</dt>
                    <dd>{money(m.price)} / м</dd>
                  </div>
                  <div>
                    <dt>Ориентир срока службы</dt>
                    <dd>{m.life}</dd>
                  </div>
                  <div>
                    <dt>Уход</dt>
                    <dd>{m.care}</dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>
        <Button
          onClick={() => {
            setCompare(false);
            onDesign();
          }}
        >
          Попробовать в конструкторе <ArrowRight size={16} />
        </Button>
      </Dialog>
    </main>
  );
}
