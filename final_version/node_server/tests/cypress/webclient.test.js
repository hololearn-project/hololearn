// /<reference types="cypress" />

context('Initializing', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4000');
  });


  describe('Login screen', () => {
    it('no name selected', () => {
      cy.get('#logInButton').click();
      cy.on('window:alert', (str) => {
        expect(str).to.equal(`Pick a valid option!`);
      });
    });

    it('no table selected', () => {
      cy.get('#name').type('Johnny');
      cy.get('#logInButton').click();
      cy.on('window:alert', (str) => {
        expect(str).to.equal(`Pick a valid option!`);
      });
    });

    it('asks for seats', () => {
      cy.get('#name').type('Johnny');
      cy.get('#Student').click();
      cy.get('#container').children()
          .should('contain', 'Where would you like to be seated?')
          .and('be.visible');
    });

    it('select camera and microphone', () => {
      cy.get('#name').type('Johnny');
      cy.get('#Student').click();
      cy.get('#Seat1').click();
      cy.get('#logInButton').click();
      cy.get('h3').should('contain', 'Select your camera')
          .and('contain', 'Select your mic');
      cy.get('#select').should('be.visible');
      cy.get('#selectMic').should('be.visible');
    });
  });
});

context('Application testing', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4000');
    cy.get('#name').type('Johnny');
    cy.get('#Student').click();
    cy.get('#Seat1').click();
    cy.get('#logInButton').click();
    // cy.get('#select').select('fake_device_0')
    // cy.get('#selectMic').select('Fake Audio Input 1')
    cy.get('#connectButton').click();
  });

  it('3d environment loads up correctly', () => {
    cy.get('#micText').should('be.hidden');
    cy.get('#camText').should('be.hidden');
    cy.get('[width="1000"]').should('be.visible');
    cy.get('#chatButton').should('be.visible');
  });

  it('chatbox sending messages', () => {
    cy.get('#chatButton').click();
    cy.get('.left-msg')
        .contains('Hi, please be nice to each other in the chat.');
    cy.get('.msger-input').type('Chatbox testing 123');
    cy.get('.msger-send-btn').click();
    cy.get('.right-msg').contains('Chatbox testing 123');
  });


  it('mute button', function(done) {
    cy.get('#mic').click();
    cy.get('#mic').should('have.css', 'background-color')
        .and('eq', 'rgb(0, 196, 65)');
    cy.get('#mic').click();
    cy.get('#mic').should('have.css', 'background-color')
        .and('eq', 'red');
    cy.on('uncaught:exception', (err, runnable) => {
      done();
      return false;
    });
  });

  it('hand raise button', () => {
    cy.get('#speak').click();
    cy.get('.tip-box-info').should('be.visible');
  });
});

context('Teacher application', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4000');
    cy.get('#name').type('Johnny');
    cy.get('#Teacher').click();
    cy.get('#logInButton').click();
    cy.get('#selectMic').select('Fake Audio Input 1');
    cy.get('#connectButton').click();
  });

  it('3d environment loads up correctly', () => {
    cy.get('[width="1000"]').should('be.visible');
    cy.get('#chatButton').should('be.visible');
    cy.get('#rotateClassroom').should('be.visible');
  });

  it('mute button', () => {
    cy.get('#mic').click();
    cy.get('#mic').should('have.css', 'background-color')
        .and('eq', 'rgb(255, 0, 0)');
    cy.get('#mic').click();
    cy.get('#mic').should('have.css', 'background-color')
        .and('eq', 'rgb(0, 196, 65)');
  });
});
