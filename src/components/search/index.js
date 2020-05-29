import React, { Component } from 'react';
import { Link } from 'gatsby';

// Search component
export default class Search extends Component {
    state = {
        query: '',
        results: [],
    }
    getSearchResults(query) {
        if (!query || !window.__LUNR__) return [];
        let langs = [];
        Object.keys(window.__LUNR__).forEach(lang => {
            if (window.__LUNR__[lang].index) {
                langs.push(lang);
            }
        });

        return langs.reduce((acc, lang) => {
            return acc.concat(window.__LUNR__[lang].index.search(query).map(
                ({ ref }) => window.__LUNR__[lang].store[ref]
            ))
        }, []);
    }

    search = event => {
        const query = event.target.value
        const results = this.getSearchResults(query)
        this.setState({ results, query })
    }
    render() {
        return (
            <div className={this.props.classNames}>
            <input className='search__input'
                type='text'
                value={this.state.query}
                onChange={this.search}
                placeholder={'Search'}
            />
            <ul className='search__list'>
                {this.state.results.map((page) => (
                <li key={page.url}>
                <Link className='search__list_white search__list_non-decoration'
                    to={page.url}>
                    {page.title}
                </Link>
                </li>
                ))}
            </ul>
            </div>
        )
    }
}
