// Собирает блоки страницы и связывает их через общее состояние.
// Страниц несколько, по одной на класс, а движок один: что показывать,
// он получает от страницы (js/pages/class-N.js).

import { prepareEvents } from './data/prepare-events.js';
import { prepareGlossary } from './data/prepare-glossary.js';
import { DEFAULT_GRADE, GRADES, createAnswer } from './card/answer.js';
import { MANY_EVENTS, createCard } from './card/card.js';
import { createChooser } from './card/chooser.js';
import { createDates } from './dates/dates.js';
import { createProjection } from './geo/projection.js';
import { createLegend } from './legend/legend.js';
import { enableControls } from './map/controls.js';
import { enableGestures } from './map/gestures.js';
import { createGeoLabels } from './map/geo-labels.js';
import { createHint } from './map/hint.js';
import { loadMap } from './map/load-map.js';
import { createLocator } from './map/locator.js';
import { createMapView } from './map/map-view.js';
import { createMarkers } from './map/markers.js';
import { createStore } from './store.js';
import { isDated, setDatesBeforeOurEra } from './time/when.js';
import { createTimeline } from './timeline/timeline.js';

// Оценка запоминается одна на все классы: её выбирает человек, а не учебник
const GRADE_KEY = 'karta-grade';
// Адреса: #p-28 — пересказ параграфа, #p-28/marathon — событие внутри него,
// #marathon — событие среди всех событий
const PARAGRAPH_PREFIX = 'p-';

// classData — всё, что отличает один класс от другого: данные учебника,
// карта и шкала ленты. Собирается в js/data/class-N/index.js
export const startApp = (classData) => {
  const app = document.querySelector('.app');

  // Лента начинается до нашей эры только у Древнего мира: там к годам
  // нашей эры нужна пометка «н.э.», на остальных страницах она лишняя
  setDatesBeforeOurEra(classData.timeline.startYear < 0);

  const events = prepareEvents({
    events: classData.events,
    places: classData.places,
    eras: classData.eras,
    answers: classData.answers,
    paragraphs: classData.paragraphs,
  });
  const eventsById = new Map(events.map((event) => [event.id, event]));
  const eraTitles = new Map(classData.eras.map((era) => [era.id, era.title]));
  const paragraphsById = new Map(classData.paragraphs.map((paragraph) => [paragraph.id, paragraph]));
  const paragraphTitles = new Map(classData.paragraphs.map((paragraph) => [paragraph.id, paragraph.title]));

  const getParagraphEvents = (paragraphId) => events.filter((event) => event.paragraph === paragraphId);

  const getPlaceIds = (list) => [...new Set(list.map((event) => event.place))];

  // Адрес может прийти какой угодно: старая ссылка, опечатка, чужая подстановка.
  // Берём из него только параграф и событие, которые у нас действительно есть
  const readHash = () => {
    let value = '';

    try {
      value = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      // Битая %-последовательность в адресе: считаем, что адрес пустой
    }

    const [head, tail] = value.split('/');

    if (head.startsWith(PARAGRAPH_PREFIX)) {
      const paragraphId = head.slice(PARAGRAPH_PREFIX.length);
      const own = getParagraphEvents(paragraphId);

      // Такого параграфа нет: открываем список параграфов.
      // События после черты нет или оно чужое: открываем пересказ параграфа
      return paragraphsById.has(paragraphId)
        ? { paragraphId, selectedId: own.find((event) => event.id === tail)?.id ?? null }
        : { paragraphId: null, selectedId: null };
    }

    return { paragraphId: null, selectedId: eventsById.has(head) ? head : null };
  };

  const toHash = ({ paragraphId, selectedId }) => {
    const eventPart = selectedId ? encodeURIComponent(selectedId) : '';

    if (paragraphId) {
      return `#${PARAGRAPH_PREFIX}${encodeURIComponent(paragraphId)}${eventPart && `/${eventPart}`}`;
    }

    return eventPart && `#${eventPart}`;
  };

  // Хранилище браузера может быть выключено или занято чужим значением
  // (ключ правили руками, осталась запись от старой версии). Берём оттуда
  // только оценку из нашего списка, иначе рассказ в карточке будет пустым
  const readGrade = () => {
    try {
      const saved = Number(window.localStorage.getItem(GRADE_KEY));

      return GRADES.includes(saved) ? saved : DEFAULT_GRADE;
    } catch {
      return DEFAULT_GRADE;
    }
  };

  const saveGrade = (grade) => {
    try {
      window.localStorage.setItem(GRADE_KEY, String(grade));
    } catch {
      // В приватном окне запись запрещена: оценка просто не запомнится
    }
  };

  // paragraphId — выбранный параграф: на карте остаются только его события.
  // Без параграфа видны все события, кроме разделов, выключенных в легенде.
  // placeId — место, открытое списком: точка, где событий слишком много,
  // чтобы листать их по кругу. В адрес оно не попадает: это не страница,
  // а шаг к событию.
  // Четыре состояния страницы:
  //   нет ни параграфа, ни события, ни места — список «Что задали?»;
  //   есть параграф, события нет             — пересказ параграфа целиком;
  //   есть место, события и параграфа нет    — список событий этого места;
  //   есть событие                           — карточка события
  const store = createStore({ ...readHash(), placeId: null, hiddenEras: new Set(), grade: readGrade() });

  const getVisibleEvents = ({ paragraphId, hiddenEras }) => {
    if (!paragraphId) {
      return events.filter((event) => !hiddenEras.has(event.era));
    }

    const own = getParagraphEvents(paragraphId);

    // В параграфе про быт или веру событий нет, и карта была бы пустой.
    // Оставляем на ней события всего раздела: видно хотя бы, где эта страна
    return own.length ? own : events.filter((event) => event.era === paragraphsById.get(paragraphId).era);
  };

  // Место открыто списком, только пока не выбраны ни событие, ни параграф
  const getOpenPlaceId = ({ placeId, selectedId, paragraphId }) =>
    eventsById.has(selectedId) || paragraphId ? null : placeId;

  // Кадр карты для параграфа: все места, которые сейчас на ней видны
  const getParagraphPlaceIds = (paragraphId) =>
    getPlaceIds(getVisibleEvents({ paragraphId, hiddenEras: new Set() }));

  // Сюда попадут команды камере, когда загрузится карта. До этого сайт
  // работает без неё: список параграфов, карточка и лента от карты не зависят
  let camera = { focus: () => {}, fit: () => {}, reset: () => {} };

  // На телефоне карта стоит над карточкой. После выбора возвращаем человека
  // наверх, иначе он нажал на параграф в середине списка и видит пустое место
  const scrollToTop = () => app.scrollIntoView({ block: 'start' });

  const select = (id) => {
    const event = eventsById.get(id);
    const { paragraphId, hiddenEras } = store.get();

    if (!event) {
      return;
    }

    // Событие выбрано — список места закрываем: иначе после «← Все параграфы»
    // человек вернулся бы не к списку параграфов, а к забытому списку места
    const patch = { selectedId: id, placeId: null };

    // Выбрали событие не из открытого параграфа (на ленте, в списке дат) —
    // переходим в его параграф, иначе карточка открыта, а точки на карте нет
    if (paragraphId && paragraphId !== event.paragraph) {
      patch.paragraphId = event.paragraph;
    }
    // То же с разделом, выключенным в легенде: возвращаем его
    if (!paragraphId && hiddenEras.has(event.era)) {
      patch.hiddenEras = new Set([...hiddenEras].filter((eraId) => eraId !== event.era));
    }

    store.set(patch);
    camera.focus(event.place);
  };

  // Открыть место списком событий. Параграф при этом закрываем: в параграфе
  // список уже есть, это его пересказ
  const openPlace = (placeId) => {
    store.set({ placeId, selectedId: null, paragraphId: null });
    camera.focus(placeId);
    scrollToTop();
    card.focusTitle();
  };

  const legend = createLegend({
    root: document.querySelector('.legend'),
    eras: classData.eras,
    onToggle: (eraId) => {
      const state = store.get();
      const hiddenEras = new Set(state.hiddenEras);

      if (hiddenEras.has(eraId)) {
        hiddenEras.delete(eraId);
      } else {
        hiddenEras.add(eraId);
      }

      // Скрыли раздел выбранного события — снимаем выбор вместе с ним
      const selected = eventsById.get(state.selectedId);
      const selectedId = selected && hiddenEras.has(selected.era) ? null : state.selectedId;
      // То же с местом, открытым списком: скрыли все его события — закрываем.
      // Иначе оно всплыло бы снова, когда раздел вернут в легенде
      const hasPlaceEvents = events.some((event) => event.place === state.placeId && !hiddenEras.has(event.era));

      store.set({ hiddenEras, selectedId, placeId: hasPlaceEvents ? state.placeId : null });
    },
  });

  const card = createCard({
    root: document.querySelector('.card'),
    places: classData.places,
    eraTitles,
    paragraphTitles,
    onPick: select,

    onStep: (direction) => {
      const state = store.get();
      // Листаем по времени, поэтому только события с датой
      const dated = getVisibleEvents(state).filter((event) => isDated(event.when));
      const index = dated.findIndex((event) => event.id === state.selectedId);
      const next = index === -1 ? null : dated[index + direction];

      if (next) {
        select(next.id);
      }
    },

    // «Все параграфы»: назад к списку
    onLeave: () => {
      store.set({ paragraphId: null, selectedId: null, placeId: null });
      camera.reset();
      scrollToTop();
    },

    // «К пересказу параграфа»: событие закрываем, параграф остаётся
    onBackToParagraph: () => {
      const { paragraphId } = store.get();

      store.set({ selectedId: null });
      camera.fit(getParagraphPlaceIds(paragraphId));
      scrollToTop();
      card.focusTitle();
    },

    // Оставить на карте один параграф или вернуть все события
    onToggleParagraph: () => {
      const { paragraphId, selectedId } = store.get();
      const selected = eventsById.get(selectedId);

      if (paragraphId) {
        store.set({ paragraphId: null });
      } else if (selected) {
        store.set({ paragraphId: selected.paragraph });
        camera.fit(getParagraphPlaceIds(selected.paragraph));
      }
    },

    // «Москва: все 64 события» в карточке события
    onOpenPlace: (placeId) => openPlace(placeId),
  });

  const chooser = createChooser({
    root: document.querySelector('.chooser'),
    eras: classData.eras,
    paragraphs: classData.paragraphs,
    counts: new Map(classData.paragraphs.map((paragraph) => [paragraph.id, getParagraphEvents(paragraph.id).length])),

    onChoose: (paragraphId) => {
      // Событие не выбираем: сначала человек видит пересказ параграфа целиком
      store.set({ paragraphId, selectedId: null, placeId: null });
      camera.fit(getParagraphPlaceIds(paragraphId));
      scrollToTop();
      card.focusTitle();
    },

    // «Смотреть всё по порядку»: без параграфа, с самого раннего события
    onShowAll: () => {
      select(events[0].id);
      scrollToTop();
      card.focusTitle();
    },
  });

  const answer = createAnswer({
    root: document.querySelector('.answer'),
    glossary: prepareGlossary({ answers: classData.answers, retellings: classData.retellings, forms: classData.wordForms }),
    onPick: select,
    onGrade: (grade) => {
      saveGrade(grade);
      store.set({ grade });
    },
  });

  const timeline = createTimeline({
    root: document.querySelector('.timeline'),
    events,
    eraTitles,
    settings: classData.timeline,
    onPick: select,
  });

  createDates({
    root: document.querySelector('.dates'),
    events,
    places: classData.places,
    eraTitles,
    onPick: (id) => {
      select(id);
      // Таблица лежит под картой. Без прокрутки наверх человек нажал
      // на строку и не увидел, что изменилось
      scrollToTop();
    },
  });

  const render = (state) => {
    const visible = getVisibleEvents(state);
    const selectedEvent = eventsById.get(state.selectedId) ?? null;
    // Параграф открыт целиком, пока в нём не выбрано событие
    const openParagraph = !selectedEvent && state.paragraphId ? paragraphsById.get(state.paragraphId) : null;
    // Место открыто списком. Если его события скрыли в легенде, показывать
    // нечего, и страница возвращается к списку параграфов
    const placeEvents = getOpenPlaceId(state) ? visible.filter((event) => event.place === state.placeId) : [];
    const openedPlace = placeEvents.length ? { id: state.placeId, events: placeEvents } : null;
    const isChoosing = !selectedEvent && !openParagraph && !openedPlace;

    // Пока ничего не выбрано, главный на странице — список параграфов:
    // на телефоне он встаёт над картой (см. css/app.css)
    app.classList.toggle('app--choosing', isChoosing);
    // В режиме параграфа легенда-фильтр не действует, поэтому её прячем
    legend.update({ hiddenEras: state.hiddenEras, isOff: Boolean(state.paragraphId) });
    chooser.update({ isVisible: isChoosing });
    card.update({
      events: visible,
      allEvents: events,
      selectedEvent,
      paragraph: openParagraph && { ...openParagraph, hasEvents: getParagraphEvents(openParagraph.id).length > 0 },
      place: openedPlace,
      isParagraphMode: Boolean(state.paragraphId),
    });
    answer.update({
      event: selectedEvent,
      // Только свои события параграфа: соседние по разделу в пересказ не идут
      paragraph: openParagraph && {
        retelling: classData.retellings[openParagraph.id],
        events: getParagraphEvents(openParagraph.id),
      },
      grade: state.grade,
    });
    timeline.update({
      // У открытого места на ленте остаются только его события: видно,
      // в какие годы здесь что-то происходило
      visibleIds: new Set((openedPlace?.events ?? visible).map((event) => event.id)),
      selectedId: state.selectedId,
    });

    // replaceState, а не присваивание hash: иначе каждое нажатие «Позже» добавляет
    // запись в историю, и кнопка «назад» в браузере перестаёт выводить со страницы.
    // Без выбора убираем решётку, но параметры адреса оставляем как были
    window.history.replaceState(null, '', toHash(state) || window.location.pathname + window.location.search);
  };

  store.subscribe(render);
  render(store.get());

  window.addEventListener('hashchange', () => {
    const next = readHash();
    const state = store.get();

    if (next.selectedId === state.selectedId && next.paragraphId === state.paragraphId) {
      return;
    }

    store.set({ ...next, placeId: null });

    const selected = eventsById.get(next.selectedId);

    if (selected) {
      camera.focus(selected.place);
    } else if (next.paragraphId) {
      camera.fit(getParagraphPlaceIds(next.paragraphId));
    } else {
      camera.reset();
    }
  });

  document.addEventListener('keydown', (event) => {
    const { selectedId } = store.get();

    // С модификаторами это команды браузера (Alt+← — «назад»), их не трогаем
    if (event.altKey || event.ctrlKey || event.metaKey || !selectedId) {
      return;
    }
    if (event.key === 'ArrowLeft') {
      document.querySelector('.card__step--back').click();
    }
    if (event.key === 'ArrowRight') {
      document.querySelector('.card__step--forward').click();
    }
  });

  const initMap = async () => {
    const viewport = document.querySelector('.map__viewport');
    const status = document.querySelector('.map__status');

    try {
      const mapData = await loadMap(classData.map.url);
      const view = createMapView(viewport, mapData, { projection: createProjection(classData.map), home: classData.map.home });
      const hint = createHint(document.querySelector('.map__hint'));
      const riverLabels = mapData.riverLabels.map((label) => ({ ...label, kind: 'river' }));

      createGeoLabels({ view, labels: [...classData.mapLabels, ...riverLabels] });
      createLocator({ container: document.querySelector('.locator'), view, landPath: mapData.land });
      enableGestures(viewport, view);
      enableControls(document.querySelector('.map-controls'), view);

      const markers = createMarkers({
        container: document.querySelector('.map__markers'),
        view,
        places: classData.places,
        onCrowding: hint.update,

        onPick: (placeId) => {
          const state = store.get();
          const atPlace = getVisibleEvents(state).filter((event) => event.place === placeId);
          const current = atPlace.findIndex((event) => event.id === state.selectedId);

          // Событий в точке много: открываем их списком. В параграфе так
          // не делаем: там событий точки немного, и все они уже перечислены
          // в пересказе
          if (!state.paragraphId && atPlace.length > MANY_EVENTS) {
            openPlace(placeId);
            return;
          }

          // Повторное нажатие на ту же точку листает события этого места по кругу
          select(atPlace[(current + 1) % atPlace.length].id);
        },
      });

      const renderMarkers = (state) => {
        markers.update({
          events: getVisibleEvents(state),
          selectedEvent: eventsById.get(state.selectedId) ?? null,
          openPlaceId: getOpenPlaceId(state),
        });
      };

      const getParagraphView = (placeIds) => view.getBoundsView(placeIds.map(markers.getPoint));

      store.subscribe(renderMarkers);
      renderMarkers(store.get());

      camera = {
        // Камеру двигаем, только если точку плохо видно: карта не должна
        // дёргаться на каждое нажатие «Позже»
        focus: (placeId) => {
          if (!markers.isClear(placeId)) {
            view.flyTo(markers.getPoint(placeId), markers.getFocusZoom(placeId));
          }
        },
        fit: (placeIds) => {
          const { center, zoom } = getParagraphView(placeIds);

          view.flyTo(center, zoom);
        },
        reset: view.reset,
      };
      status.remove();

      // Страницу открыли по ссылке — сразу ставим кадр на место, без перелёта:
      // человек не должен сначала смотреть, как карта едет из первого кадра
      view.onReady(() => {
        const { paragraphId, selectedId } = store.get();
        const selected = eventsById.get(selectedId);

        if (paragraphId) {
          const { center, zoom } = getParagraphView(getParagraphPlaceIds(paragraphId));

          view.jumpTo(center, zoom);
        } else if (selected) {
          view.jumpTo(markers.getPoint(selected.place), markers.getFocusZoom(selected.place));
        }
      });
    } catch (error) {
      // Подробности — разработчику в консоль, посетителю хватит простых слов
      console.error(error);
      status.textContent = `${error.message} Список параграфов и рассказы работают и без карты.`;
      status.classList.add('map__status--error');
    }
  };

  initMap();
};
