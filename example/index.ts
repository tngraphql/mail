/**
 * Created by Phan Trung Nguyên.
 * User: nguyenpl117
 * Date: 3/31/2020
 * Time: 9:50 AM
 */
import { Application, LoadConfiguration } from '@tngraphql/illuminate';
import { MailManager } from '../src/Mail/MailManager';
import { Mailable } from '../src/Mail/Mailable';
import * as path from 'path';

async function main() {
    const app = new Application();

    await (new LoadConfiguration()).bootstrap(app);

    app.config.set('mail', {
        default: 'smtp',
        mailers: {
            smtp: {
                transport: 'smtp',
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: 'nguyenpl117@gmail.com',
                    pass: 'cjthfdyxjycnwotw'
                }
            },
            ses: {
                transport: 'ses',
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: 'nguyenpl117@gmail.com',
                    pass: 'cjthfdyxjycnwotw'
                }
            }
        },
        from: {
            address: 'nguyen@gmail.com',
            name: 'nguyen'
        },
        to: {
            address: 'njkfsk@gmail.com'
        }
    })
    app.config.set('app', {
        name: 'TNGraphQL'
    })

    const mail = new MailManager(app);

    class Order extends Mailable {
        constructor(public data) {
            super();
        }

        build() {
            this.htmlView('order', this);
        }
    }

    app.singleton('view', () => {
        const edge = require('edge.js')
        edge.registerViews(path.join(__dirname, '../src', 'resources/views'));
        const config = app.config
        edge.global('config', function(key, defaultValue = '') {
            return app.config.get(key, defaultValue);
        });

        return edge;
    })

    // mail.send(new Order({ username: 'nguyen' }))
    //
    // mail.to([{ id: 1, name: 'test', email: 'gfasgs' }])
    //     .bcc([{ id: 1, name: 'test', email: 'gfasgsfs' }])
    //     .send(new Order({ username: 'nguyen' }));

    // mail.mailer('ses').send(new Mailable());
    const exp = require('express')();

    const view = app.use<any>('view');
    // view.mount('email', path.join(__dirname, 'resources/views', 'text'))
    /*view.registerTemplate('button', {
        template: `<button class="{{ type || 'primary' }}">
<!--        @!yield($slots.asfs())-->
          @!yield($slots.main())
        </button>`,
        Presenter: class Presenter {
         constructor (protected state) {
             // console.log(state.$slots.asfs());
                   this.state = state
         }
       }
    });*/

    exp.get('/', (req, res) => {
        var inlineCss = require('inline-css');
        const html = view.render('order', {introLines: ['nguyen'], link: 'https://phantrungnguyen.com'})

        inlineCss(view.render('order', { introLines: ['nguyen'], link: 'https://phantrungnguyen.com' }), {
            url: 'http://localhost:3000'
        })
            .then(function(html) {
                res.send(html);
            });


    })

    exp.listen(3000, 'localhost', () => {
        console.log('http://localhost:3000');
    })
}

main();
