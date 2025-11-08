/**
 * Unit tests for questSystem.js
 * Tests quest management, progress tracking, and completion
 */

import questSystem from '../../js/questSystem.js';

describe('Quest System', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    // Reset quest system state
    questSystem.activeQuests = [];
    questSystem.completedQuests = [];
    questSystem.quests = [];
  });

  describe('Initialization', () => {
    test('should create quest system', () => {
      expect(questSystem).toBeDefined();
    });

    test('should initialize with empty arrays when no saved data', () => {
      expect(Array.isArray(questSystem.quests)).toBe(true);
      expect(Array.isArray(questSystem.activeQuests)).toBe(true);
      expect(Array.isArray(questSystem.completedQuests)).toBe(true);
    });

    test('should create initial quests on first run', () => {
      questSystem.createInitialQuests();
      expect(questSystem.activeQuests.length).toBeGreaterThan(0);
    });

    test('should load quests from localStorage if available', () => {
      const savedData = {
        activeQuests: [{ id: 'test', title: 'Test Quest' }],
        completedQuests: [{ id: 'completed', title: 'Done' }]
      };
      localStorage.setItem('quests', JSON.stringify(savedData));

      questSystem.loadQuests();
      expect(questSystem.activeQuests.length).toBeGreaterThan(0);
    });
  });

  describe('Quest Management', () => {
    test('should add quest to active quests', () => {
      const initialCount = questSystem.activeQuests.length;
      questSystem.addQuest({
        id: 'test_quest',
        title: 'Test Quest',
        description: 'Test description',
        objective: { type: 'test', target: 5 },
        reward: { type: 'notification', message: 'Done!' }
      });

      expect(questSystem.activeQuests.length).toBe(initialCount + 1);
    });

    test('should initialize quest progress to 0', () => {
      questSystem.addQuest({
        id: 'progress_test',
        title: 'Progress Test',
        objective: { type: 'test', target: 10 }
      });

      const quest = questSystem.activeQuests.find(q => q.id === 'progress_test');
      expect(quest.progress).toBe(0);
    });

    test('should mark new quests as not completed', () => {
      questSystem.addQuest({
        id: 'incomplete',
        title: 'Incomplete Quest',
        objective: { type: 'test', target: 1 }
      });

      const quest = questSystem.activeQuests.find(q => q.id === 'incomplete');
      expect(quest.completed).toBe(false);
    });

    test('should get active quests', () => {
      const activeQuests = questSystem.getActiveQuests();
      expect(Array.isArray(activeQuests)).toBe(true);
    });

    test('should get completed quests', () => {
      const completedQuests = questSystem.getCompletedQuests();
      expect(Array.isArray(completedQuests)).toBe(true);
      expect(completedQuests.length).toBe(0);
    });
  });

  describe('Quest Progress', () => {
    beforeEach(() => {
      questSystem.activeQuests = [];
      questSystem.addQuest({
        id: 'progress_quest',
        title: 'Progress Quest',
        objective: { type: 'cast', target: 10 },
        reward: { type: 'notification', message: 'Complete!' }
      });
    });

    test('should update quest progress', () => {
      questSystem.updateQuestProgress('progress_quest', 5);

      const quest = questSystem.activeQuests.find(q => q.id === 'progress_quest');
      expect(quest.progress).toBe(5);
    });

    test('should not error when updating non-existent quest', () => {
      expect(() => {
        questSystem.updateQuestProgress('fake_quest', 10);
      }).not.toThrow();
    });

    test('should complete quest when progress reaches target', () => {
      questSystem.updateQuestProgress('progress_quest', 10);

      expect(questSystem.activeQuests.find(q => q.id === 'progress_quest')).toBeUndefined();
      expect(questSystem.completedQuests.find(q => q.id === 'progress_quest')).toBeDefined();
    });

    test('should mark quest as completed', () => {
      questSystem.updateQuestProgress('progress_quest', 10);

      const quest = questSystem.completedQuests.find(q => q.id === 'progress_quest');
      expect(quest.completed).toBe(true);
    });
  });

  describe('Quest Completion', () => {
    beforeEach(() => {
      questSystem.activeQuests = [];
      questSystem.completedQuests = [];
      questSystem.addQuest({
        id: 'complete_test',
        title: 'Completion Test',
        objective: { type: 'test', target: 5 },
        reward: { type: 'notification', message: 'Done!' }
      });
    });

    test('should move quest from active to completed', () => {
      questSystem.completeQuest('complete_test');

      expect(questSystem.activeQuests.find(q => q.id === 'complete_test')).toBeUndefined();
      expect(questSystem.completedQuests.find(q => q.id === 'complete_test')).toBeDefined();
    });

    test('should not error when completing non-existent quest', () => {
      expect(() => {
        questSystem.completeQuest('fake_quest');
      }).not.toThrow();
    });

    test('should handle multiple quest completions', () => {
      questSystem.addQuest({
        id: 'second_quest',
        title: 'Second Quest',
        objective: { type: 'test', target: 1 },
        reward: { type: 'notification', message: 'Second done!' }
      });

      questSystem.completeQuest('complete_test');
      questSystem.completeQuest('second_quest');

      expect(questSystem.completedQuests.length).toBe(2);
    });
  });

  describe('Save and Load', () => {
    test('should save quests to localStorage', () => {
      questSystem.saveQuests();

      const saved = localStorage.getItem('quests');
      expect(saved).toBeDefined();
      expect(saved).not.toBeNull();
    });

    test('should save active and completed quests', () => {
      questSystem.saveQuests();

      const saved = JSON.parse(localStorage.getItem('quests'));
      expect(saved.activeQuests).toBeDefined();
      expect(saved.completedQuests).toBeDefined();
    });

    test('should load saved quests', () => {
      questSystem.addQuest({
        id: 'save_test',
        title: 'Save Test',
        objective: { type: 'test', target: 1 }
      });
      questSystem.saveQuests();

      // Clear and reload
      questSystem.activeQuests = [];
      questSystem.loadQuests();
      const hasQuest = questSystem.activeQuests.some(q => q.id === 'save_test');
      expect(hasQuest).toBe(true);
    });

    test('should handle corrupted localStorage data', () => {
      localStorage.setItem('quests', 'corrupted{data');

      expect(() => {
        questSystem.loadQuests();
      }).not.toThrow();
    });
  });

  describe('Rewards', () => {
    test('should give notification reward', () => {
      const reward = { type: 'notification', message: 'Test!' };

      expect(() => {
        questSystem.giveReward(reward);
      }).not.toThrow();
    });

    test('should give AB reward when gameState exists', () => {
      window.gameState = { ab: 100 };
      const reward = { type: 'ab', amount: 50 };

      questSystem.giveReward(reward);

      expect(window.gameState.ab).toBe(150);
      delete window.gameState;
    });

    test('should handle missing reward amount', () => {
      window.gameState = { ab: 100 };
      const reward = { type: 'ab' };

      questSystem.giveReward(reward);

      expect(window.gameState.ab).toBe(100);
      delete window.gameState;
    });
  });
});
