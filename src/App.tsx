import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { ArrowUpRight, Check, FolderOpen, Menu, X } from "lucide-react";
import { createProject, deserialize, validateProject } from "./domain/project";
import { readDraft, writeDraft } from "./services/storage";
import {
  emptyHistory,
  recordHistory,
  undoHistory,
  redoHistory,
} from "./domain/history";
import { CATALOG } from "./data/catalog";
import type { Project } from "./domain/types";
import { Landing } from "./components/site/Landing";
const Configurator = lazy(() =>
  import("./components/configurator/Configurator").then((m) => ({
    default: m.Configurator,
  })),
);
import { Booking } from "./components/site/Booking";
import { Button } from "./components/ui/button";
import { Dialog } from "./components/ui/dialog";
import { PhoneInput } from "./components/ui/phone-input";
function initialProject() {
  try {
    if (window.location.hash.startsWith("#project="))
      return deserialize(window.location.hash.slice(9));
  } catch {
    /* Reported on mount without replacing the local draft. */
  }
  return readDraft() ?? createProject();
}
export default function App() {
  const [project, setProject] = useState<Project>(initialProject),
    [planner, setPlanner] = useState(
      window.location.hash === "#planner" ||
        window.location.hash.startsWith("#project="),
    ),
    [menu, setMenu] = useState(false),
    [booking, setBooking] = useState(false),
    [consult, setConsult] = useState(false),
    [consultDone, setConsultDone] = useState(false),
    [projectsOpen, setProjectsOpen] = useState(false),
    [toast, setToast] = useState("");
  const historyState = useRef(emptyHistory(project));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const storageError = useRef(false);
  useEffect(() => {
    if (!consult || !consultDone) return;
    const timeout = setTimeout(() => setConsult(false), 5000);
    return () => clearTimeout(timeout);
  }, [consult, consultDone]);
  const notify = useCallback((message: string) => {
    setToast(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 5000);
  }, []);
  useEffect(() => {
    if (window.location.hash.startsWith("#project=")) {
      try {
        deserialize(window.location.hash.slice(9));
        history.replaceState(null, "", "#planner");
      } catch (err) {
        notify((err as Error).message);
      }
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [notify]);
  useEffect(() => {
    try {
      writeDraft(project);
    } catch {
      if (!storageError.current) {
        storageError.current = true;
        notify(
          "Автосохранение недоступно. Проект остаётся в памяти; используйте ссылку для сохранения.",
        );
      }
    }
  }, [project, notify]);
  const update = (next: Project, group?: string) => {
    try {
      const valid = validateProject(next);
      historyState.current = recordHistory(historyState.current, valid, group);
      setProject(valid);
      return true;
    } catch (err) {
      notify((err as Error).message);
      return false;
    }
  };
  const replace = (next: Project, record = true) => {
    const valid = validateProject(next);
    const metadata = (snapshot: Project): Project => ({
      ...snapshot,
      id: valid.id,
      savedAt: valid.savedAt,
    });
    historyState.current = record
      ? recordHistory(historyState.current, valid)
      : {
          ...historyState.current,
          current: valid,
          past: historyState.current.past.map(metadata),
          future: historyState.current.future.map(metadata),
        };
    setProject(valid);
  };
  const undo = () => {
    historyState.current = undoHistory(historyState.current);
    setProject(historyState.current.current);
  };
  const redo = () => {
    historyState.current = redoHistory(historyState.current);
    setProject(historyState.current.current);
  };
  const navigate = (design: boolean) => {
    setPlanner(design);
    setMenu(false);
    history.pushState(null, "", design ? "#planner" : window.location.pathname);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  useEffect(() => {
    const onPop = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#project=")) {
        try {
          const imported = deserialize(hash.slice(9));
          setProject(imported);
          historyState.current = emptyHistory(imported);
          history.replaceState(null, "", "#planner");
        } catch (err) {
          notify((err as Error).message);
        }
      }
      setPlanner(hash === "#planner" || hash.startsWith("#project="));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [notify]);
  const navAnchor = (target: string) => {
    if (planner) {
      navigate(false);
      setTimeout(
        () =>
          document
            .querySelector(target)
            ?.scrollIntoView({ behavior: "smooth" }),
        50,
      );
    }
    setMenu(false);
  };
  const navLinks = (
    <>
      <a href="#collections" onClick={() => navAnchor("#collections")}>
        Кухни
      </a>
      <a href="#projects" onClick={() => navAnchor("#projects")}>
        Проекты
      </a>
      <a href="#materials" onClick={() => navAnchor("#materials")}>
        Материалы
      </a>
      <a href="#philosophy" onClick={() => navAnchor("#philosophy")}>
        О фабрике
      </a>
      <a href="#contacts" onClick={() => navAnchor("#contacts")}>
        Контакты
      </a>
    </>
  );
  return (
    <MotionConfig reducedMotion="user">
      <header className="site-header">
        <a
          className="logo"
          href="/"
          aria-label="FORMA MEBEL — на главную"
          onClick={(ev) => {
            ev.preventDefault();
            navigate(false);
          }}
        >
          FORMA<span>MEBEL</span>
        </a>
        <nav className="desktop-nav" aria-label="Основная навигация">
          {navLinks}
        </nav>
        <div className="header-actions">
          <button
            className="icon-button projects-header"
            aria-label="Мои проекты"
            onClick={() => {
              navigate(true);
              setProjectsOpen(true);
            }}
          >
            <FolderOpen size={19} strokeWidth={1.4} />
          </button>
          <Button
            variant="outline"
            size="small"
            className="header-design"
            onClick={() => navigate(true)}
          >
            Конструктор кухни <ArrowUpRight size={14} />
          </Button>
          <button
            className="icon-button mobile-menu"
            aria-label="Открыть меню"
            onClick={() => setMenu(true)}
          >
            <Menu size={22} />
          </button>
        </div>
      </header>
      <Suspense
        fallback={
          <main className="loading-page">
            <span className="eyebrow">FORMA MEBEL</span>
            <h1>Открываем ваш проект…</h1>
          </main>
        }
      >
        {planner ? (
          <Configurator
            project={project}
            update={update}
            replace={replace}
            undo={undo}
            redo={redo}
            canUndo={historyState.current.past.length > 0}
            canRedo={historyState.current.future.length > 0}
            onBack={() => navigate(false)}
            onBook={() => setBooking(true)}
            notify={notify}
            openProjects={projectsOpen}
            setOpenProjects={setProjectsOpen}
          />
        ) : (
          <Landing
            project={project}
            onDesign={() => navigate(true)}
            onCatalog={(id) => {
              const c = CATALOG.find((c) => c.id === id)!;
              update({
                ...project,
                facade: c.facade,
                color: c.color,
                name: `Кухня ${c.name}`,
                texture: c.facade === "veneer" ? "wood" : "smooth",
              });
              navigate(true);
            }}
            onConsult={() => {
              setConsultDone(false);
              setConsult(true);
            }}
          />
        )}
      </Suspense>
      <Dialog open={menu} onOpenChange={setMenu} title="FORMA MEBEL">
        <nav className="mobile-navigation" aria-label="Мобильная навигация">
          {navLinks}
          <Button onClick={() => navigate(true)}>
            Спроектировать кухню <ArrowUpRight size={16} />
          </Button>
        </nav>
      </Dialog>
      <Dialog
        open={booking}
        onOpenChange={setBooking}
        title="Начнём с точных размеров"
        description="Запись на бесплатный замер."
        wide
      >
        <Booking project={project} compact />
      </Dialog>
      <Dialog
        open={consult}
        onOpenChange={setConsult}
        title={consultDone ? "Спасибо за вашу идею!" : "Расскажите о вашей идее"}
        description={consultDone ? undefined : "Обсудим планировку, материалы и детали будущей кухни."}
        hideHeadingText={consultDone}
      >
        <Consultation done={consultDone} onSuccess={() => setConsultDone(true)} />
      </Dialog>
      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            className="toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Check size={17} />
            <span>{toast}</span>
            <button
              onClick={() => setToast("")}
              aria-label="Закрыть уведомление"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
function Consultation({ done, onSuccess }: { done: boolean; onSuccess: () => void }) {
  const [phoneValue, setPhoneValue] = useState("");
  const [error, setError] = useState("");
  if (done)
    return (
      <motion.div
        className="consult-success"
        role="status"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <span className="consult-success-icon"><Check size={28} strokeWidth={1.5} /></span>
        <h3>Спасибо за вашу идею!</h3>
      </motion.div>
    );
  return (
    <form
      className="consult-form"
      onSubmit={(ev) => {
        ev.preventDefault();
        const data = new FormData(ev.currentTarget);
        const name = String(data.get("name") ?? "").trim();
        const phone = String(data.get("phone") ?? "").replace(/\D/g, "");
        const message = String(data.get("message") ?? "").trim();
        if (name.length < 2) {
          setError("Укажите имя — не менее двух символов.");
          return;
        }
        if (phone.length !== 11 || !phone.startsWith("7")) {
          setError("Введите 10 цифр номера после +7.");
          return;
        }
        if (message.length < 5) {
          setError("Расскажите о вашей идее — не менее пяти символов.");
          return;
        }
        setError("");
        onSuccess();
      }}
    >
      <label>
        Ваше имя
        <input
          required
          minLength={2}
          maxLength={80}
          name="name"
          autoComplete="given-name"
          placeholder="Как к вам обращаться"
        />
      </label>
      <label>
        Телефон
        <PhoneInput value={phoneValue} onChange={setPhoneValue} />
      </label>
      <label>
        Какая кухня вам близка?
        <textarea
          required
          minLength={5}
          maxLength={1500}
          name="message"
          placeholder="Расскажите о планировке, материалах или любимых деталях"
        />
      </label>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <Button type="submit">
        Обсудить идею <ArrowUpRight size={16} />
      </Button>
    </form>
  );
}
